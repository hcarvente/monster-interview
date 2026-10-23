// The whole back-end flow for one interview, kept apart from Next.js so it can be
// unit tested. The real AI call is INJECTED (passed in as `evaluate`), so tests can
// hand in a fake that fails on purpose, without spending any tokens.
//
// Flow: parse -> validate input (Guardrail A) -> block duplicates -> build prompt ->
//       ONE AI call -> validate output (Guardrail B) -> reply. Any thrown error is
//       sorted into a friendly message (Guardrail C). There are NO automatic retries.
import { validateRequest } from "./validateRequest.js";
import { SYSTEM_PROMPT, FEEDBACK_SCHEMA, buildUserMessage } from "./prompts.js";
import { parseAndValidateFeedback } from "./validateFeedback.js";
import { classifyAiError } from "./aiErrors.js";

// Every response is { status, body, headers? } so the route just forwards it.
function fail(status, code, message, extra = {}) {
  return { status, body: { error: { code, message, ...extra } } };
}

//   evaluate - async function({ systemPrompt, userMessage, schema }) -> { text, usage }
//   inFlight - a Set shared across requests; holds fingerprints of running interviews
//   log      - where to write server logs (console by default)
export function createEvaluateHandler({ evaluate, inFlight = new Set(), log = console }) {
  // `rawBody` is the request body as TEXT, so malformed JSON can be handled here too.
  return async function handle(rawBody) {
    // 1. Parse. JSON.parse throws on bad JSON, so it must be in try/catch.
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return fail(400, "INVALID_INPUT", "Request body must be valid JSON.");
    }

    // 2. GUARDRAIL A: reject bad input before anything that costs money.
    const input = validateRequest(body);
    if (!input.ok) {
      return fail(400, input.code, input.message);
    }

    // 3. Duplicate guard: the same cleaned interview already running? Reject it.
    //    (In memory, so it only protects one server process. Fine for the MVP.)
    const key = JSON.stringify(input.value);
    if (inFlight.has(key)) {
      return fail(
        409,
        "DUPLICATE_REQUEST",
        "That interview is already being judged. Please wait a moment."
      );
    }
    inFlight.add(key);

    try {
      // 4. Build the messages and make the ONE AI call.
      const userMessage = buildUserMessage(input.value.categoryId, input.value.answers);
      const { text, usage } = await evaluate({
        systemPrompt: SYSTEM_PROMPT,
        userMessage,
        schema: FEEDBACK_SCHEMA,
      });

      // Token COUNTS only. Never the answers, the feedback text or the key.
      log.log(
        `[evaluate] tokens in=${usage?.inputTokens} out=${usage?.outputTokens} thought=${usage?.thoughtTokens}`
      );

      // 5. GUARDRAIL B: check the reply before anyone sees it.
      const checked = parseAndValidateFeedback(text);
      if (!checked.ok) {
        log.error(`[evaluate] invalid AI output: ${checked.reason}`);
        return fail(
          502,
          "INVALID_OUTPUT",
          "The Count's reply got scrambled in the mist. Please try again."
        );
      }

      return { status: 200, body: { feedback: checked.value, usage } };
    } catch (error) {
      // 6. GUARDRAIL C: any failure becomes a friendly message. Log only the error's
      //    name, code and status, because full messages can echo request content.
      const outcome = classifyAiError(error);
      log.error(
        `[evaluate] failed: ${error?.name} code=${error?.code ?? ""} status=${error?.status ?? ""} -> ${outcome.code}`
      );
      const extra = outcome.retryAfterSeconds ? { retryAfterSeconds: outcome.retryAfterSeconds } : {};
      const response = fail(outcome.status, outcome.code, outcome.message, extra);
      if (outcome.retryAfterSeconds) {
        response.headers = { "Retry-After": String(outcome.retryAfterSeconds) };
      }
      return response;
    } finally {
      // 7. Always release the fingerprint, even after a failure.
      inFlight.delete(key);
    }
  };
}
