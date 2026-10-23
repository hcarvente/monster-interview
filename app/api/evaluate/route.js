// SERVER-SIDE ONLY. This file never runs in the browser.
// A Route Handler: Next.js calls the exported POST function whenever the browser
// sends a POST request to /api/evaluate (the folder path becomes the URL).
//
// STEP 5b: this returns a hard-coded MOCK response. No AI is called yet.
// The real AI call arrives in Step 6, and will live right where the mock is.
import { validateRequest } from "@/lib/validateRequest";

// Fingerprints of requests being processed right now. If an identical request
// arrives while one is in flight (e.g. a double-click or a script), we reject it.
// This lives in this server process's memory, which is fine for the MVP but would
// not be shared across multiple server instances.
const inFlight = new Set();

// A short fake "thinking" delay so we can SEE the loading state and test the
// duplicate guard. Removed in Step 6 when the real AI call takes its place.
const MOCK_DELAY_MS = 1500;

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
    // 4. MOCK: wait a moment, then return fixed feedback in the same shape the
    //    real AI result will have (Step 6). `usage` stays null until we have real
    //    token counts (Step 8).
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

    return Response.json({
      feedback: {
        title: "The Count Has Spoken (mock result)",
        overall:
          "This is placeholder feedback from the mock server. No AI was called.",
        strengths: ["Mock strength one", "Mock strength two"],
        improvements: ["Mock improvement one", "Mock improvement two"],
        improvedAnswer: {
          questionNumber: 1,
          text: "Mock improved answer. Real feedback arrives in Step 6.",
        },
      },
      usage: null,
    });
  } finally {
    // 5. Always free the fingerprint, even if something above threw, otherwise
    //    this interview could never be submitted again.
    inFlight.delete(key);
  }
}
