// GUARDRAIL A: input validation.
// Runs on the SERVER before any AI call. The browser also does light checks, but
// anything in the browser can be bypassed (DevTools, curl), so this is the check
// that counts. It protects reliability (no garbage reaches the AI) and cost (no
// oversized answers, no wasted calls on empty ones).
//
// It is a "pure function": same input -> same output, no network, no AI, no
// side effects. That makes it easy to unit test without spending any tokens.
//
// Imports use a relative path + ".js" so Node's test runner can load this file
// as well as Next.js.
import { getCharacter } from "./characters.js";
import { getCategory, MAX_ANSWER_CHARS, QUESTIONS_PER_INTERVIEW } from "./questions.js";

// Every rejection looks the same, so the route handler can treat them uniformly.
function invalid(message) {
  return { ok: false, code: "INVALID_INPUT", message };
}

// `body` is whatever JSON the client sent. We treat it as UNTRUSTED: it could be
// null, a string, an array, or an object with the wrong shape.
// Returns { ok: true, value } with cleaned data, or { ok: false, code, message }.
export function validateRequest(body) {
  // 1. The body must be a plain object (not null, not an array, not a string).
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return invalid("Request body must be a JSON object.");
  }

  const { characterId, categoryId, answers } = body;

  // 2. The character must exist AND be playable. For the MVP only Dracula is.
  const character = getCharacter(characterId);
  if (!character || !character.available) {
    return invalid("That interviewer is not available.");
  }

  // 3. The category must be one of our fixed categories. The server looks up the
  //    questions itself later, so the client only ever sends an id.
  if (!getCategory(categoryId)) {
    return invalid("Unknown interview category.");
  }

  // 4. Exactly the expected number of answers, in an array.
  if (!Array.isArray(answers) || answers.length !== QUESTIONS_PER_INTERVIEW) {
    return invalid(`Expected exactly ${QUESTIONS_PER_INTERVIEW} answers.`);
  }

  // 5. Check each answer. We build a cleaned (trimmed) copy to send onward, so
  //    stray spaces never cost tokens.
  const cleaned = [];
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];

    // Must be a string (rejects null, numbers, objects).
    if (typeof answer !== "string") {
      return invalid(`Answer ${i + 1} must be text.`);
    }

    const trimmed = answer.trim();

    // Empty or spaces-only answers give the AI nothing to evaluate.
    if (trimmed === "") {
      return invalid(`Answer ${i + 1} is empty.`);
    }

    // The textarea's maxLength is only a browser convenience; enforce it here.
    if (trimmed.length > MAX_ANSWER_CHARS) {
      return invalid(`Answer ${i + 1} is longer than ${MAX_ANSWER_CHARS} characters.`);
    }

    cleaned.push(trimmed);
  }

  // Only these three cleaned fields move on. Any extra fields the client sent
  // (e.g. a sneaky "systemPrompt") are dropped here.
  return {
    ok: true,
    value: { characterId, categoryId, answers: cleaned },
  };
}
