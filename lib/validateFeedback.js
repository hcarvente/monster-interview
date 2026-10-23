// GUARDRAIL B: output validation.
// The AI's reply is UNTRUSTED, just like the user's answers. Asking for JSON in the
// prompt and schema is a request, not a guarantee, so before anything reaches the
// screen we check: is it valid JSON, are all fields present with the right types
// and sizes, and does it avoid fake scores or hiring claims?
//
// Pure functions (no network, no AI), so they are unit tested with no tokens.
import { QUESTIONS_PER_INTERVIEW } from "./questions.js";

// Size caps. These are a little looser than the word limits in the prompt, so a
// slightly wordy but fine reply is accepted, while a runaway one is rejected.
export const LIMITS = {
  title: 100,
  overall: 700,
  item: 300, // each strength / improvement
  improvedAnswer: 1200,
  minItems: 2,
  maxItems: 3,
};

// Text patterns that would be an unsupported conclusion. The product promise is
// "practice, not a real hiring decision", and the prompt forbids scores, so a
// reply containing these has broken the rules and is rejected.
const FORBIDDEN_PATTERNS = [
  /\b\d{1,3}\s*(?:\/|out of)\s*\d{1,3}\b/i, // "8/10", "9 out of 10"
  /\bscore(?:d)?\s*(?:of|:)?\s*\d/i, //        "score of 9", "scored 85"
  /\b\d{1,3}\s*%/, //                          "85%"
  /\byou(?:'re|\s+are|\s+have been|\s+were)\s+(?:definitely\s+|officially\s+)?hired\b/i,
  /\byou(?:'ve|\s+have)?\s+(?:got|get|won|earned)\s+the\s+(?:job|position|role|internship|fellowship)\b/i,
  /\byou(?:'re|\s+are)\s+(?:definitely\s+|officially\s+)?(?:rejected|not hired)\b/i,
];

function fail(reason) {
  return { ok: false, code: "INVALID_OUTPUT", reason };
}

// True for a string that has real text in it.
function isText(value) {
  return typeof value === "string" && value.trim() !== "";
}

// Checks a list of 2-3 short strings and returns the cleaned list (or null).
function cleanItems(value, name) {
  if (!Array.isArray(value)) return { error: `${name} must be a list` };
  if (value.length < LIMITS.minItems || value.length > LIMITS.maxItems) {
    return { error: `${name} must have ${LIMITS.minItems}-${LIMITS.maxItems} items` };
  }
  const cleaned = [];
  for (const item of value) {
    if (!isText(item)) return { error: `${name} has an empty or non-text item` };
    if (item.trim().length > LIMITS.item) return { error: `${name} item is too long` };
    cleaned.push(item.trim());
  }
  return { cleaned };
}

// `raw` is the already-parsed JSON from the AI (could be anything).
// Returns { ok: true, value } with a CLEAN copy containing only expected fields,
// or { ok: false, code: "INVALID_OUTPUT", reason }. `reason` is for our logs and
// tests only; the user never sees it.
export function validateFeedback(raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return fail("feedback is not an object");
  }

  // Text fields.
  if (!isText(raw.title)) return fail("title is missing or empty");
  if (raw.title.trim().length > LIMITS.title) return fail("title is too long");
  if (!isText(raw.overall)) return fail("overall is missing or empty");
  if (raw.overall.trim().length > LIMITS.overall) return fail("overall is too long");

  // Lists.
  const strengths = cleanItems(raw.strengths, "strengths");
  if (strengths.error) return fail(strengths.error);
  const improvements = cleanItems(raw.improvements, "improvements");
  if (improvements.error) return fail(improvements.error);

  // The improved answer: a question number we can map back, plus its text.
  const improved = raw.improvedAnswer;
  if (improved === null || typeof improved !== "object" || Array.isArray(improved)) {
    return fail("improvedAnswer is missing or not an object");
  }
  const n = improved.questionNumber;
  if (!Number.isInteger(n) || n < 1 || n > QUESTIONS_PER_INTERVIEW) {
    return fail("improvedAnswer.questionNumber is not a valid question number");
  }
  if (!isText(improved.text)) return fail("improvedAnswer.text is missing or empty");
  if (improved.text.trim().length > LIMITS.improvedAnswer) {
    return fail("improvedAnswer.text is too long");
  }

  const value = {
    title: raw.title.trim(),
    overall: raw.overall.trim(),
    strengths: strengths.cleaned,
    improvements: improvements.cleaned,
    improvedAnswer: { questionNumber: n, text: improved.text.trim() },
  };

  // No fake scores or hiring decisions in the AI's own assessment. We do NOT scan
  // improvedAnswer.text: it is written in the user's voice and may legitimately
  // repeat a number the user themselves gave (e.g. "raised 20% more").
  const assessmentText = [value.title, value.overall, ...value.strengths, ...value.improvements];
  for (const text of assessmentText) {
    if (FORBIDDEN_PATTERNS.some((pattern) => pattern.test(text))) {
      return fail("feedback contains a score or hiring claim");
    }
  }

  return { ok: true, value };
}

// The AI hands us TEXT. This turns it into an object (JSON.parse throws on bad
// JSON, so it is wrapped in try/catch) and then validates it.
export function parseAndValidateFeedback(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return fail("response text is empty");
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return fail("response is not valid JSON");
  }
  return validateFeedback(parsed);
}
