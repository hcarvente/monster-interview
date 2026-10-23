// SERVER-SIDE ONLY. This file never runs in the browser.
// A Route Handler: Next.js calls the exported POST function whenever the browser
// sends a POST request to /api/evaluate (the folder path becomes the URL).
//
// This is where the whole back-end flow happens, in order:
//   validate input -> block duplicates -> build prompt -> ONE AI call -> reply.
import { validateRequest } from "@/lib/validateRequest";
import { SYSTEM_PROMPT, FEEDBACK_SCHEMA, buildUserMessage } from "@/lib/prompts";
import { evaluateInterview } from "@/lib/aiClient";

// Fingerprints of requests being processed right now. If an identical request
// arrives while one is in flight (e.g. a double-click or a script), we reject it.
// This lives in this server process's memory, which is fine for the MVP but would
// not be shared across multiple server instances.
const inFlight = new Set();

// Small helper so every error response has the same shape:
// { error: { code, message } } plus the right HTTP status number.
function errorResponse(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(request) {
  // 1. Read the body. request.json() throws if the body isn't valid JSON,
  //    so it must be inside try/catch or a bad request would crash the handler.
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_INPUT", "Request body must be valid JSON.");
  }

  // 2. GUARDRAIL A: validate before doing anything that costs money.
  const result = validateRequest(body);
  if (!result.ok) {
    return errorResponse(400, result.code, result.message);
  }

  // 3. Duplicate-submission guard. We fingerprint the CLEANED data, so spaces or
  //    extra fields can't be used to dodge the check.
  const key = JSON.stringify(result.value);
  if (inFlight.has(key)) {
    return errorResponse(
      409,
      "DUPLICATE_REQUEST",
      "That interview is already being judged. Please wait a moment."
    );
  }
  inFlight.add(key);

  try {
    // 4. Build the two messages: our fixed rules, and the (escaped) interview data.
    const userMessage = buildUserMessage(result.value.categoryId, result.value.answers);

    // 5. THE ONE AI CALL for this interview. It happens only here, on the server,
    //    and only because the user clicked "Reveal My Fate".
    const { text, usage } = await evaluateInterview({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      schema: FEEDBACK_SCHEMA,
    });

    // 6. TEMPORARY: parse the AI's JSON text. Step 7 replaces this with full
    //    output validation (Guardrail B), so for now this trusts the AI too much.
    const feedback = JSON.parse(text);

    // Log token COUNTS only. Never log the answers or the key.
    console.log(
      `[evaluate] tokens in=${usage.inputTokens} out=${usage.outputTokens} thought=${usage.thoughtTokens}`
    );

    return Response.json({ feedback, usage });
  } catch (error) {
    // TEMPORARY catch-all. Step 7 maps specific failures (429, timeout, bad
    // output) to specific friendly messages. Log only the error's name/code/status,
    // never its full text, which could echo request content.
    console.error(
      `[evaluate] failed: ${error?.name} code=${error?.code ?? ""} status=${error?.status ?? ""}`
    );
    return errorResponse(
      502,
      "AI_ERROR",
      "The monsters' crystal ball is cloudy. Please try again."
    );
  } finally {
    // 7. Always free the fingerprint, even if something above threw, otherwise
    //    this interview could never be submitted again.
    inFlight.delete(key);
  }
}
