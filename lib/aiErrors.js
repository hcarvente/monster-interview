// GUARDRAIL C: turning AI/network failures into friendly, safe messages.
// The user must never see raw provider errors (they are confusing and can leak
// details), and the code that calls the AI should not need to know every way a
// call can fail. This one function sorts any thrown error into a small set of
// outcomes: an HTTP status, a short code, and a message written for a human.
//
// It recognizes errors by their `status` number and `name` instead of importing
// the SDK's classes, so it is easy to unit test with plain fake errors.

// How long to ask the user to wait after a rate limit when the provider does not say.
const DEFAULT_RETRY_SECONDS = 30;
const MIN_RETRY_SECONDS = 5;
const MAX_RETRY_SECONDS = 120;

// Reads the provider's "Retry-After" header (seconds) if there is one, and keeps
// the result in a sensible range so a weird header cannot lock the button forever.
function retryAfterSeconds(error) {
  const raw = error?.headers?.get?.("retry-after");
  const seconds = Number(raw);
  const value = Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_SECONDS;
  return Math.min(MAX_RETRY_SECONDS, Math.max(MIN_RETRY_SECONDS, Math.ceil(value)));
}

// Returns { status, code, message, retryAfterSeconds? } for any thrown value.
export function classifyAiError(error) {
  const status = error?.status;
  const name = error?.name;

  // Our own AiError: the call "worked" but the reply was unusable.
  if (name === "AiError" && (error.code === "INCOMPLETE" || error.code === "EMPTY")) {
    return {
      status: 502,
      code: "INVALID_OUTPUT",
      message: "The Count's reply got scrambled in the mist. Please try again.",
    };
  }

  // Our own AiError: the server is missing its key. A setup problem, not the user's.
  if (name === "AiError" && error.code === "CONFIG") {
    return configProblem();
  }

  // 429: too many requests (or quota used up). Ask the user to wait a bit.
  if (status === 429) {
    return {
      status: 429,
      code: "RATE_LIMITED",
      message: "The monsters are swamped right now. Wait a moment, then try again.",
      retryAfterSeconds: retryAfterSeconds(error),
    };
  }

  // Took too long, or we gave up waiting.
  if (name === "APIConnectionTimeoutError" || name === "AbortError" || name === "TimeoutError") {
    return {
      status: 504,
      code: "TIMEOUT",
      message: "The Count took too long to answer. Please try again.",
    };
  }

  // Could not reach the AI service at all (network down, DNS, connection reset).
  if (
    name === "APIConnectionError" ||
    name === "APIUserAbortError" ||
    (error instanceof TypeError && /fetch|network/i.test(error.message))
  ) {
    return {
      status: 503,
      code: "NETWORK",
      message: "Could not reach the Count's castle. Check your connection and try again.",
    };
  }

  // Bad key, no permission, or a model that no longer exists: our setup, not the user's.
  if (status === 401 || status === 403 || status === 404) {
    return configProblem();
  }

  // The AI service itself is having trouble.
  if (typeof status === "number" && status >= 500) {
    return {
      status: 502,
      code: "AI_UNAVAILABLE",
      message: "The AI service is having trouble right now. Please try again soon.",
    };
  }

  // Anything else we did not anticipate.
  return {
    status: 502,
    code: "AI_ERROR",
    message: "The monsters' crystal ball is cloudy. Please try again.",
  };
}

function configProblem() {
  return {
    status: 500,
    code: "SERVER_CONFIG",
    // Deliberately vague: details about keys or models belong in server logs only.
    message: "The app is not set up to reach the AI right now. This is not your fault.",
  };
}
