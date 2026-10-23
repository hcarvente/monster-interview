// DEVELOPMENT ONLY: fake AI behaviors for testing failures by hand, spending no tokens.
// Turn one on by adding a line to .env.local and restarting `npm run dev`, e.g.:
//     AI_MODE=rate-limit
// route.js ignores AI_MODE completely when NODE_ENV is "production".
//
// Each mock behaves like the real evaluateInterview(): it resolves with
// { text, usage } or throws an error shaped like the SDK's errors.

export const MOCK_MODES = [
  "ok", //          a good reply, instantly (also a safe fallback for a demo)
  "slow", //        a good reply after 4 seconds (to try the duplicate-submit guard)
  "rate-limit", //  HTTP 429
  "timeout", //     the AI took too long
  "network", //     the AI service could not be reached
  "server-error", // HTTP 500 from the AI service
  "auth", //        HTTP 403 (bad key)
  "bad-json", //    reply is not JSON
  "bad-output", //  JSON, but a field is missing
  "score-claim", // valid shape, but contains "9/10" and "you're hired"
  "empty", //       the reply has no text
];

const GOOD_REPLY = {
  title: "A Fangs-tastic Simulated Verdict",
  overall:
    "My dear candidate, this is a SIMULATED reply from the mock, with no real AI involved. Your answers would be judged here. Keep practicing!",
  strengths: ["Mock strength: clear and direct.", "Mock strength: gave an example."],
  improvements: ["Mock tip: add a specific detail.", "Mock tip: describe the result."],
  improvedAnswer: { questionNumber: 1, text: "A simulated, stronger version of your first answer." },
};

const USAGE = { inputTokens: 0, outputTokens: 0, thoughtTokens: 0 };

// Builds an error that looks like the SDK's (name + status + headers).
function sdkError(name, status, message, headers) {
  const error = new Error(message);
  error.name = name;
  error.status = status;
  error.headers = headers;
  return error;
}

export function isMockMode(mode) {
  return MOCK_MODES.includes(mode);
}

export function createMockEvaluate(mode) {
  return async function mockEvaluate() {
    switch (mode) {
      case "ok":
        return { text: JSON.stringify(GOOD_REPLY), usage: USAGE };
      case "slow":
        await new Promise((resolve) => setTimeout(resolve, 4000));
        return { text: JSON.stringify(GOOD_REPLY), usage: USAGE };
      case "rate-limit":
        throw sdkError("RateLimitError", 429, "simulated", new Headers({ "retry-after": "20" }));
      case "timeout":
        throw sdkError("APIConnectionTimeoutError", undefined, "simulated");
      case "network":
        throw sdkError("APIConnectionError", undefined, "simulated");
      case "server-error":
        throw sdkError("InternalServerError", 500, "simulated");
      case "auth":
        throw sdkError("PermissionDeniedError", 403, "simulated");
      case "bad-json":
        return { text: "Sorry, here is your feedback: {oops", usage: USAGE };
      case "bad-output": {
        const { strengths, ...missingField } = GOOD_REPLY;
        return { text: JSON.stringify(missingField), usage: USAGE };
      }
      case "score-claim":
        return {
          text: JSON.stringify({ ...GOOD_REPLY, overall: "You get 9/10 and you're hired!" }),
          usage: USAGE,
        };
      case "empty":
        return { text: "", usage: USAGE };
      default:
        throw new Error(`Unknown mock mode: ${mode}`);
    }
  };
}
