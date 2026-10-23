// Tests for the cost math. Pure arithmetic: no AI, no key, no tokens.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PRICING, estimateCost, worstCaseUsage, formatUsd } from "../lib/usage.js";
import { MAX_OUTPUT_TOKENS } from "../lib/aiClient.js";

// Floating-point numbers are not exact, so compare with a tiny tolerance.
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not close to ${expected}`);
}

test("1M input + 1M output tokens costs exactly the two list prices added together", () => {
  const cost = estimateCost({ inputTokens: 1_000_000, outputTokens: 1_000_000, thoughtTokens: 0 });
  close(cost.inputCost, PRICING.inputPerMillion);
  close(cost.outputCost, PRICING.outputPerMillion);
  close(cost.total, PRICING.inputPerMillion + PRICING.outputPerMillion);
});

test("the measured interview from the dev server log (844 in, 346 out)", () => {
  const cost = estimateCost({ inputTokens: 844, outputTokens: 346, thoughtTokens: 0 });
  close(cost.inputCost, (844 * 0.3) / 1e6); // 0.0002532
  close(cost.outputCost, (346 * 2.5) / 1e6); // 0.000865
  close(cost.total, 0.0011182);
  close(cost.per1000, 1.1182);
});

test("thinking tokens are billed as output tokens", () => {
  const withThinking = estimateCost({ inputTokens: 0, outputTokens: 100, thoughtTokens: 50 });
  const asOutput = estimateCost({ inputTokens: 0, outputTokens: 150, thoughtTokens: 0 });
  close(withThinking.total, asOutput.total);
});

test("zero tokens cost zero", () => {
  assert.equal(estimateCost({ inputTokens: 0, outputTokens: 0, thoughtTokens: 0 }).total, 0);
});

test("missing or unusable counts give null, not a made-up number", () => {
  assert.equal(estimateCost(undefined), null);
  assert.equal(estimateCost({}), null);
  assert.equal(estimateCost({ inputTokens: 100, outputTokens: null }), null);
  assert.equal(estimateCost({ inputTokens: "100", outputTokens: 50 }), null);
});

test("a different model gives null, because our prices only apply to one model", () => {
  const usage = { inputTokens: 100, outputTokens: 100, thoughtTokens: 0 };
  assert.equal(estimateCost(usage, "some-other-model"), null);
  assert.notEqual(estimateCost(usage, PRICING.model), null);
});

test("missing thinking count is treated as zero", () => {
  const a = estimateCost({ inputTokens: 500, outputTokens: 200, thoughtTokens: null });
  const b = estimateCost({ inputTokens: 500, outputTokens: 200, thoughtTokens: 0 });
  close(a.total, b.total);
});

test("the worst case always uses the output cap we send to the API", () => {
  const worst = worstCaseUsage(2000, 1000);
  assert.equal(worst.outputTokens, MAX_OUTPUT_TOKENS);
  assert.equal(worst.inputTokens, 750); // (2000 + 1000) / 4
  assert.ok(estimateCost(worst).total > estimateCost({ inputTokens: 844, outputTokens: 346, thoughtTokens: 0 }).total);
});

test("formatUsd keeps enough decimals to show tiny amounts", () => {
  assert.equal(formatUsd(0.0011182), "$0.00112");
  assert.equal(formatUsd(1.1182, 2), "$1.12");
});

test("the pricing record states where it came from and when it was checked", () => {
  assert.ok(PRICING.source.startsWith("https://"));
  assert.match(PRICING.checkedOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(PRICING.pageLastUpdated, /^\d{4}-\d{2}-\d{2}$/);
});
