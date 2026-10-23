// Prints the cost estimate for one interview and for 1,000 interviews.
// Run with:  npm run cost
// No AI call, no key, no tokens spent: it only does arithmetic on numbers.
import { PRICING, estimateCost, worstCaseUsage, formatUsd } from "../lib/usage.js";
import { SYSTEM_PROMPT, buildUserMessage } from "../lib/prompts.js";
import { CATEGORIES, MAX_ANSWER_CHARS, QUESTIONS_PER_INTERVIEW } from "../lib/questions.js";
import { MAX_OUTPUT_TOKENS } from "../lib/aiClient.js";

function show(label, usage) {
  const cost = estimateCost(usage);
  console.log(`\n${label}`);
  console.log(`  tokens: in=${usage.inputTokens}  out=${usage.outputTokens}  thinking=${usage.thoughtTokens}`);
  console.log(`  cost per interview:      ${formatUsd(cost.total)}`);
  console.log(`  cost per 1,000 interviews: ${formatUsd(cost.per1000, 2)}`);
}

console.log("MONSTER INTERVIEW: cost estimate");
console.log(`model: ${PRICING.model}  (${PRICING.tier})`);
console.log(`prices: $${PRICING.inputPerMillion} per 1M input tokens, $${PRICING.outputPerMillion} per 1M output tokens`);
console.log(`source: ${PRICING.source} (page last updated ${PRICING.pageLastUpdated}, checked ${PRICING.checkedOn})`);
console.log(PRICING.note);

// 1. A real interview we measured in the browser (numbers from the server log).
show("MEASURED: a real interview from the dev server log", {
  inputTokens: 844,
  outputTokens: 346,
  thoughtTokens: 0,
});

// 2. The worst case our own limits allow: every answer at the 800-character cap.
const maxAnswers = Array(QUESTIONS_PER_INTERVIEW).fill("x".repeat(MAX_ANSWER_CHARS));
const longestCategoryMessage = CATEGORIES.map((c) => buildUserMessage(c.id, maxAnswers))
  .sort((a, b) => b.length - a.length)[0];
const worst = worstCaseUsage(SYSTEM_PROMPT.length, longestCategoryMessage.length);
show(
  `WORST CASE: 3 answers of ${MAX_ANSWER_CHARS} characters, output at the ${MAX_OUTPUT_TOKENS}-token cap\n  (input is estimated at ~4 characters per token)`,
  worst
);
