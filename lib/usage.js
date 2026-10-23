// TOKEN AND COST MATH. Pure functions: no network, no AI, so they are easy to test.
//
// A "token" is a chunk of text (very roughly 4 characters of English). The provider
// bills separately for tokens we SEND (input) and tokens it WRITES (output), and
// output costs more per token. This file turns real token counts into dollars.
import { MAX_OUTPUT_TOKENS } from "./aiClient.js";

// Prices are copied by hand from the provider's pricing page, never guessed.
// If the model or the prices change, update ALL of these and the date.
export const PRICING = {
  model: "gemini-3.5-flash-lite",
  inputPerMillion: 0.3, //  USD per 1,000,000 input tokens
  outputPerMillion: 2.5, // USD per 1,000,000 output tokens (page says this INCLUDES thinking tokens)
  tier: "Standard, paid list price",
  note: "On the free tier real spend is $0; these are the rates that apply on a paid plan.",
  source: "https://ai.google.dev/gemini-api/docs/pricing",
  pageLastUpdated: "2026-10-22",
  checkedOn: "2026-10-23",
};

const PER_MILLION = 1_000_000;

// usage: { inputTokens, outputTokens, thoughtTokens } as reported by the provider.
// model: the model that produced it. Prices only apply to PRICING.model, so a
//        different model gives null instead of a wrong number.
// Returns { inputCost, outputCost, total, per1000 } in USD, or null if it cannot be computed.
export function estimateCost(usage, model = PRICING.model) {
  if (model !== PRICING.model) return null;
  const { inputTokens, outputTokens, thoughtTokens } = usage ?? {};
  if (!Number.isFinite(inputTokens) || !Number.isFinite(outputTokens)) return null;

  // Thinking tokens are billed as output. If the provider reports them separately,
  // add them; if not reported (null), count 0.
  const billableOutput = outputTokens + (Number.isFinite(thoughtTokens) ? thoughtTokens : 0);

  const inputCost = (inputTokens / PER_MILLION) * PRICING.inputPerMillion;
  const outputCost = (billableOutput / PER_MILLION) * PRICING.outputPerMillion;
  const total = inputCost + outputCost;
  return { inputCost, outputCost, total, per1000: total * 1000 };
}

// A rough ceiling on one interview's cost, for planning. Input is ESTIMATED from
// text length (about 4 characters per token); output uses the hard cap we send to
// the API (MAX_OUTPUT_TOKENS), so the real output can never exceed it.
export function worstCaseUsage(systemPromptChars, userMessageChars) {
  return {
    inputTokens: Math.ceil((systemPromptChars + userMessageChars) / 4),
    outputTokens: MAX_OUTPUT_TOKENS,
    thoughtTokens: 0,
  };
}

// Formats dollars for display, keeping enough decimals to see tiny amounts.
export function formatUsd(amount, decimals = 5) {
  return `$${amount.toFixed(decimals)}`;
}
