// SERVER-SIDE ONLY. This file never runs in the browser.
// A Route Handler: Next.js calls the exported POST function whenever the browser
// sends a POST request to /api/evaluate (the folder path becomes the URL).
//
// It is deliberately thin. All the real logic (validation, duplicate guard, the AI
// call, output checks, error handling) lives in lib/evaluateHandler.js so it can be
// unit tested. This file only connects Next.js to that logic.
import { createEvaluateHandler } from "@/lib/evaluateHandler";
import { evaluateInterview } from "@/lib/aiClient";
import { createMockEvaluate, isMockMode } from "@/lib/mockAi";

// Fingerprints of interviews being processed right now, shared by all requests.
// It lives in this server process's memory, which is fine for the MVP but would not
// be shared across multiple server instances.
const inFlight = new Set();

export async function POST(request) {
  // DEV ONLY: AI_MODE can swap the real AI for a simulated behavior (see lib/mockAi.js).
  // It is ignored in production so a stray setting can never fake results for real users.
  const mode = process.env.NODE_ENV !== "production" ? process.env.AI_MODE : undefined;
  const useMock = isMockMode(mode);
  if (useMock) {
    console.log(`[evaluate] AI_MODE=${mode}: SIMULATED, no real AI call`);
  }

  const handle = createEvaluateHandler({
    evaluate: useMock ? createMockEvaluate(mode) : evaluateInterview,
    inFlight,
  });

  // Read the body as text; the handler parses it so bad JSON is handled in one place.
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    // An unreadable body falls through as "", which the handler rejects as invalid JSON.
  }

  const result = await handle(rawBody);
  return Response.json(result.body, { status: result.status, headers: result.headers });
}
