// SERVER-SIDE ONLY. The ONLY file that talks to the AI provider (Google Gemini).
// If we ever switch providers again, this is the file that changes.
// It must never be imported by browser code: it reads the secret API key.
import { GoogleGenAI } from "@google/genai";

// Hard limits that keep cost and waiting time predictable.
// MAX_OUTPUT_TOKENS caps how long the AI's answer can be (we pay per output token).
// TIMEOUT_MS stops us waiting forever if the provider hangs.
export const MAX_OUTPUT_TOKENS = 700;
export const TIMEOUT_MS = 20000;

// Model id comes from the environment so it can be changed without editing code.
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

// A small error type so the route can tell WHAT went wrong without exposing
// raw provider details to the user. `code` is our own short label.
export class AiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}

// Builds the real SDK client. It reads GEMINI_API_KEY from the server's
// environment (loaded from .env.local). We only check the key EXISTS; the
// value is never printed or logged anywhere.
function createRealClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new AiError("CONFIG", "GEMINI_API_KEY is not set on the server.");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Sends ONE evaluation request and returns the raw result.
//   systemPrompt - our fixed rules (lib/prompts.js)
//   userMessage  - the interview data (built by buildUserMessage)
//   schema       - the JSON shape we want back
//   client       - optional. Tests pass a fake here so no real call (and no
//                  tokens) is used. Real code leaves it out.
// Returns { text, usage }: `text` is the AI's JSON as a STRING (not yet parsed or
// validated) and `usage` is the token counts the provider reported.
export async function evaluateInterview(
  { systemPrompt, userMessage, schema },
  client = createRealClient()
) {
  const interaction = await client.interactions.create(
    {
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      system_instruction: systemPrompt, // our rules, kept separate from user data
      input: userMessage, // the untrusted answers live only here
      generation_config: { max_output_tokens: MAX_OUTPUT_TOKENS },
      response_format: {
        type: "text",
        mime_type: "application/json", // ask for JSON that follows `schema`
        schema,
      },
    },
    {
      // maxRetries: 0 means the SDK must NOT silently retry a failed call.
      // Retrying costs money and hides problems; a retry is the user's choice.
      maxRetries: 0,
      timeout: TIMEOUT_MS,
    }
  );

  // If the answer was cut off (e.g. hit the output cap) or otherwise did not
  // finish, the JSON may be broken, so treat it as unusable.
  if (interaction.status !== undefined && interaction.status !== "completed") {
    throw new AiError("INCOMPLETE", `AI response status: ${interaction.status}`);
  }

  const text = interaction.output_text;
  if (typeof text !== "string" || text.trim() === "") {
    throw new AiError("EMPTY", "The AI returned no text.");
  }

  const usage = interaction.usage ?? {};
  return {
    text,
    usage: {
      inputTokens: usage.total_input_tokens ?? null,
      outputTokens: usage.total_output_tokens ?? null,
      // "Thinking" tokens some models spend before answering. We track them in
      // case they count toward the output cap or the bill.
      thoughtTokens: usage.total_thought_tokens ?? null,
    },
  };
}
