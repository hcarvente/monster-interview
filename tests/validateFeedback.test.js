// Unit tests for Guardrail B. No AI, no network, no tokens.
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFeedback, parseAndValidateFeedback, LIMITS } from "../lib/validateFeedback.js";

// A known-good AI reply. Each test copies it and breaks ONE thing.
function goodFeedback(overrides = {}) {
  return {
    title: "A Fangs-tastic Start",
    overall: "My dear candidate, you showed real enthusiasm. Add a bit more detail.",
    strengths: ["Clear motivation.", "Gave a real example."],
    improvements: ["Name the tools you used.", "Describe the outcome."],
    improvedAnswer: { questionNumber: 2, text: "A clearer version of your answer." },
    ...overrides,
  };
}

function assertRejected(result) {
  assert.equal(result.ok, false);
  assert.equal(result.code, "INVALID_OUTPUT");
  assert.equal(typeof result.reason, "string");
}

test("accepts a normal reply", () => {
  const result = validateFeedback(goodFeedback());
  assert.equal(result.ok, true);
  assert.equal(result.value.improvedAnswer.questionNumber, 2);
});

test("trims whitespace and drops unexpected extra fields", () => {
  const result = validateFeedback(goodFeedback({ title: "  Hello  ", hiringDecision: "hired" }));
  assert.equal(result.ok, true);
  assert.equal(result.value.title, "Hello");
  assert.equal("hiringDecision" in result.value, false);
});

test("rejects replies that are not objects", () => {
  for (const bad of [null, undefined, "text", 42, true, [], [goodFeedback()]]) {
    assertRejected(validateFeedback(bad));
  }
});

test("rejects each missing required field", () => {
  for (const field of ["title", "overall", "strengths", "improvements", "improvedAnswer"]) {
    const reply = goodFeedback();
    delete reply[field];
    assertRejected(validateFeedback(reply));
  }
});

test("rejects empty or non-text title and overall", () => {
  for (const field of ["title", "overall"]) {
    for (const bad of ["", "   ", null, 5, ["x"]]) {
      assertRejected(validateFeedback(goodFeedback({ [field]: bad })));
    }
  }
});

test("rejects lists of the wrong size or wrong type", () => {
  for (const field of ["strengths", "improvements"]) {
    assertRejected(validateFeedback(goodFeedback({ [field]: [] })));
    assertRejected(validateFeedback(goodFeedback({ [field]: ["only one"] })));
    assertRejected(validateFeedback(goodFeedback({ [field]: ["a", "b", "c", "d"] })));
    assertRejected(validateFeedback(goodFeedback({ [field]: "a, b" })));
    assertRejected(validateFeedback(goodFeedback({ [field]: ["a", ""] })));
    assertRejected(validateFeedback(goodFeedback({ [field]: ["a", 7] })));
  }
});

test("accepts lists of exactly 2 and exactly 3", () => {
  assert.equal(validateFeedback(goodFeedback({ strengths: ["a", "b"] })).ok, true);
  assert.equal(validateFeedback(goodFeedback({ strengths: ["a", "b", "c"] })).ok, true);
});

test("rejects a bad improvedAnswer", () => {
  for (const bad of [
    null,
    "text",
    {},
    { questionNumber: 2 },
    { text: "x" },
    { questionNumber: 0, text: "x" },
    { questionNumber: 4, text: "x" },
    { questionNumber: 1.5, text: "x" },
    { questionNumber: "2", text: "x" },
    { questionNumber: 2, text: "   " },
  ]) {
    assertRejected(validateFeedback(goodFeedback({ improvedAnswer: bad })));
  }
});

test("rejects over-long fields", () => {
  assertRejected(validateFeedback(goodFeedback({ title: "x".repeat(LIMITS.title + 1) })));
  assertRejected(validateFeedback(goodFeedback({ overall: "x".repeat(LIMITS.overall + 1) })));
  assertRejected(validateFeedback(goodFeedback({ strengths: ["ok", "x".repeat(LIMITS.item + 1)] })));
  assertRejected(
    validateFeedback(goodFeedback({ improvedAnswer: { questionNumber: 1, text: "x".repeat(LIMITS.improvedAnswer + 1) } }))
  );
});

test("rejects invented scores", () => {
  for (const claim of [
    "You get 8/10 for this.",
    "That is 9 out of 10.",
    "I give a score of 9.",
    "You scored 85 overall.",
    "Your answer was 85% there.",
  ]) {
    assertRejected(validateFeedback(goodFeedback({ overall: claim })));
    assertRejected(validateFeedback(goodFeedback({ strengths: ["ok", claim] })));
  }
});

test("rejects hiring decisions", () => {
  for (const claim of [
    "You're hired!",
    "You are hired, my dear candidate.",
    "You got the job.",
    "You've got the position.",
    "You are rejected.",
    "You're not hired.",
  ]) {
    assertRejected(validateFeedback(goodFeedback({ title: claim })));
    assertRejected(validateFeedback(goodFeedback({ improvements: ["ok", claim] })));
  }
});

test("does not reject honest wording that merely mentions hiring", () => {
  const overall = "This is practice, not a hiring decision. A real team may weigh things differently.";
  assert.equal(validateFeedback(goodFeedback({ overall })).ok, true);
});

test("allows a number inside the improved answer (it may repeat the user's own fact)", () => {
  const improvedAnswer = { questionNumber: 1, text: "I raised donations by 20% for our club." };
  assert.equal(validateFeedback(goodFeedback({ improvedAnswer })).ok, true);
});

test("parseAndValidateFeedback handles good, bad and empty text", () => {
  assert.equal(parseAndValidateFeedback(JSON.stringify(goodFeedback())).ok, true);
  assertRejected(parseAndValidateFeedback("{not json"));
  assertRejected(parseAndValidateFeedback("```json\n{}\n```"));
  assertRejected(parseAndValidateFeedback(""));
  assertRejected(parseAndValidateFeedback("   "));
  assertRejected(parseAndValidateFeedback(undefined));
  assertRejected(parseAndValidateFeedback("null"));
  assertRejected(parseAndValidateFeedback("{}"));
});
