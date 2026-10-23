// Tests for the whole back-end flow (Guardrails A, B and C together), using a FAKE
// AI that we control. No network, no key, no tokens spent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEvaluateHandler } from "../lib/evaluateHandler.js";
import { createMockEvaluate, MOCK_MODES } from "../lib/mockAi.js";
import { AiError } from "../lib/aiClient.js";
import { MAX_ANSWER_CHARS } from "../lib/questions.js";

const GOOD_REPLY = {
  title: "A Fangs-tastic Start",
  overall: "My dear candidate, a solid start. Add more detail.",
  strengths: ["Clear motivation.", "Gave an example."],
  improvements: ["Name the tools you used.", "Describe the result."],
  improvedAnswer: { questionNumber: 1, text: "A clearer version of your answer." },
};
const USAGE = { inputTokens: 800, outputTokens: 300, thoughtTokens: 0 };

// Builds a handler around a fake `evaluate`, and records every call and log line.
function setup(evaluateImpl) {
  const calls = [];
  const logs = [];
  const handle = createEvaluateHandler({
    evaluate: async (args) => {
      calls.push(args);
      return evaluateImpl(args);
    },
    inFlight: new Set(),
    log: { log: (m) => logs.push(m), error: (m) => logs.push(m) },
  });
  return { handle, calls, logs };
}

const okReply = () => ({ text: JSON.stringify(GOOD_REPLY), usage: USAGE });

function body(overrides = {}) {
  return JSON.stringify({
    characterId: "dracula",
    categoryId: "internship",
    answers: ["Answer one", "Answer two", "Answer three"],
    ...overrides,
  });
}

// An error shaped like the SDK's.
function sdkError(name, status, headers) {
  const error = new Error("SECRET-PROVIDER-DETAILS");
  error.name = name;
  error.status = status;
  error.headers = headers;
  return error;
}

// ---------- Successful normal interview ----------

test("a normal interview returns validated feedback and usage, with exactly one AI call", async () => {
  const { handle, calls } = setup(okReply);
  const result = await handle(body());
  assert.equal(result.status, 200);
  assert.equal(result.body.feedback.title, GOOD_REPLY.title);
  assert.deepEqual(result.body.usage, USAGE);
  assert.equal(calls.length, 1);
});

test("the AI receives the system prompt, the schema and the user's answers (not the other way round)", async () => {
  const { handle, calls } = setup(okReply);
  await handle(body());
  assert.ok(calls[0].systemPrompt.includes("Count Dracula"));
  assert.ok(calls[0].userMessage.includes("Answer two"));
  assert.equal(calls[0].systemPrompt.includes("Answer two"), false);
  assert.ok(calls[0].schema.properties.title);
});

// ---------- Guardrail A: bad input never reaches the AI ----------

test("invalid requests are rejected with 400 and the AI is never called", async () => {
  const cases = {
    "empty answer": body({ answers: ["ok", "", "ok"] }),
    "whitespace-only answer": body({ answers: ["ok", "   \n ", "ok"] }),
    "over-long answer": body({ answers: ["ok", "x".repeat(MAX_ANSWER_CHARS + 1), "ok"] }),
    "missing answer (only 2)": body({ answers: ["a", "b"] }),
    "null answer": body({ answers: ["a", null, "c"] }),
    "unknown category": body({ categoryId: "astronaut" }),
    "character not playable": body({ characterId: "zombie" }),
    "malformed JSON": "{oops",
    "empty body": "",
    "JSON that is not an object": "123",
    "JSON null": "null",
  };
  for (const [name, raw] of Object.entries(cases)) {
    const { handle, calls } = setup(okReply);
    const result = await handle(raw);
    assert.equal(result.status, 400, name);
    assert.equal(result.body.error.code, "INVALID_INPUT", name);
    assert.equal(calls.length, 0, `${name}: AI must not be called`);
  }
});

// ---------- Guardrail C: API failures ----------

test("a 429 becomes a friendly rate-limit reply, with NO retry", async () => {
  const { handle, calls } = setup(() => {
    throw sdkError("RateLimitError", 429, new Headers({ "retry-after": "45" }));
  });
  const result = await handle(body());
  assert.equal(result.status, 429);
  assert.equal(result.body.error.code, "RATE_LIMITED");
  assert.equal(result.body.error.retryAfterSeconds, 45);
  assert.equal(result.headers["Retry-After"], "45");
  assert.equal(calls.length, 1, "must not retry automatically");
  assert.equal(JSON.stringify(result.body).includes("SECRET-PROVIDER-DETAILS"), false);
});

test("the retry wait defaults to 30s and is kept between 5s and 120s", async () => {
  const wait = async (headers) => {
    const { handle } = setup(() => {
      throw sdkError("RateLimitError", 429, headers);
    });
    return (await handle(body())).body.error.retryAfterSeconds;
  };
  assert.equal(await wait(undefined), 30);
  assert.equal(await wait(new Headers({ "retry-after": "9999" })), 120);
  assert.equal(await wait(new Headers({ "retry-after": "1" })), 5);
  assert.equal(await wait(new Headers({ "retry-after": "banana" })), 30);
});

test("a timeout becomes a friendly 504", async () => {
  const { handle, calls } = setup(() => {
    throw sdkError("APIConnectionTimeoutError", undefined);
  });
  const result = await handle(body());
  assert.equal(result.status, 504);
  assert.equal(result.body.error.code, "TIMEOUT");
  assert.equal(calls.length, 1);
});

test("a network failure becomes a friendly 503", async () => {
  for (const make of [
    () => sdkError("APIConnectionError", undefined),
    () => new TypeError("fetch failed"),
  ]) {
    const { handle } = setup(() => {
      throw make();
    });
    const result = await handle(body());
    assert.equal(result.status, 503);
    assert.equal(result.body.error.code, "NETWORK");
  }
});

test("provider 5xx errors become a friendly 502", async () => {
  const { handle } = setup(() => {
    throw sdkError("InternalServerError", 503);
  });
  const result = await handle(body());
  assert.equal(result.status, 502);
  assert.equal(result.body.error.code, "AI_UNAVAILABLE");
});

test("bad key, forbidden or missing model are reported as a setup problem without details", async () => {
  for (const status of [401, 403, 404]) {
    const { handle } = setup(() => {
      throw sdkError("SomeError", status);
    });
    const result = await handle(body());
    assert.equal(result.status, 500, `status ${status}`);
    assert.equal(result.body.error.code, "SERVER_CONFIG");
    assert.equal(JSON.stringify(result.body).includes("SECRET-PROVIDER-DETAILS"), false);
  }
});

test("a missing API key (our own AiError) is a setup problem", async () => {
  const { handle } = setup(() => {
    throw new AiError("CONFIG", "GEMINI_API_KEY is not set on the server.");
  });
  const result = await handle(body());
  assert.equal(result.body.error.code, "SERVER_CONFIG");
  assert.equal(JSON.stringify(result.body).includes("GEMINI_API_KEY"), false);
});

test("an unexpected error still becomes a safe friendly reply", async () => {
  const { handle } = setup(() => {
    throw new Error("SECRET-PROVIDER-DETAILS");
  });
  const result = await handle(body());
  assert.equal(result.status, 502);
  assert.equal(result.body.error.code, "AI_ERROR");
  assert.equal(JSON.stringify(result.body).includes("SECRET-PROVIDER-DETAILS"), false);
});

// ---------- Guardrail B: unusable AI output ----------

test("invalid or empty AI output is rejected with 502 INVALID_OUTPUT", async () => {
  const { strengths, ...missingField } = GOOD_REPLY;
  const replies = {
    "not JSON": "Sure! Here is your feedback: {oops",
    "empty text": "",
    "missing field": JSON.stringify(missingField),
    "wrong type": JSON.stringify({ ...GOOD_REPLY, strengths: "great" }),
    "score claim": JSON.stringify({ ...GOOD_REPLY, overall: "You get 9/10." }),
    "hiring claim": JSON.stringify({ ...GOOD_REPLY, title: "You're hired!" }),
  };
  for (const [name, text] of Object.entries(replies)) {
    const { handle, calls } = setup(() => ({ text, usage: USAGE }));
    const result = await handle(body());
    assert.equal(result.status, 502, name);
    assert.equal(result.body.error.code, "INVALID_OUTPUT", name);
    assert.equal(calls.length, 1, `${name}: no retry`);
  }
});

test("a cut-off or empty reply reported by the AI client is INVALID_OUTPUT", async () => {
  for (const code of ["INCOMPLETE", "EMPTY"]) {
    const { handle } = setup(() => {
      throw new AiError(code, "x");
    });
    const result = await handle(body());
    assert.equal(result.body.error.code, "INVALID_OUTPUT", code);
  }
});

// ---------- Duplicate submission ----------

test("a duplicate submission while one is running is rejected, and the AI is called once", async () => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const { handle, calls } = setup(async () => {
    await gate; // the first request is "still running"
    return okReply();
  });

  const first = handle(body());
  const second = await handle(body()); // identical, arrives while the first is in flight
  assert.equal(second.status, 409);
  assert.equal(second.body.error.code, "DUPLICATE_REQUEST");

  release();
  assert.equal((await first).status, 200);
  assert.equal(calls.length, 1);
});

test("whitespace changes cannot dodge the duplicate check", async () => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const { handle } = setup(async () => {
    await gate;
    return okReply();
  });
  const first = handle(body());
  const second = await handle(body({ answers: ["  Answer one ", "Answer two\n", "\tAnswer three"] }));
  assert.equal(second.status, 409);
  release();
  await first;
});

test("the same interview can be submitted again after it finished, or after it failed", async () => {
  let shouldFail = true;
  const { handle, calls } = setup(() => {
    if (shouldFail) throw sdkError("RateLimitError", 429);
    return okReply();
  });
  assert.equal((await handle(body())).status, 429); // fails, lock must be released
  shouldFail = false;
  assert.equal((await handle(body())).status, 200); // deliberate retry works
  assert.equal((await handle(body())).status, 200); // and so does a later repeat
  assert.equal(calls.length, 3);
});

// ---------- Logging ----------

test("logs never contain the user's answers or raw provider details", async () => {
  const secretAnswer = "MY-PRIVATE-ANSWER-TEXT";
  const answers = [secretAnswer, "b", "c"];

  const failing = setup(() => {
    throw sdkError("RateLimitError", 429);
  });
  await failing.handle(body({ answers }));

  const succeeding = setup(okReply);
  await succeeding.handle(body({ answers }));

  for (const line of [...failing.logs, ...succeeding.logs]) {
    assert.equal(line.includes(secretAnswer), false);
    assert.equal(line.includes("SECRET-PROVIDER-DETAILS"), false);
  }
  assert.ok(succeeding.logs.some((line) => line.includes("tokens in=800 out=300")));
});

// ---------- Cost in the log ----------

test("the log line includes an estimated cost when the model's price is known", async () => {
  const { handle, logs } = setup(() => ({ text: JSON.stringify(GOOD_REPLY), usage: USAGE, model: "gemini-3.5-flash-lite" }));
  await handle(body());
  const line = logs.find((l) => l.includes("tokens in="));
  assert.ok(line.includes("est.cost=$"), line);
});

test("no cost is logged for a model we have no price for", async () => {
  const { handle, logs } = setup(() => ({ text: JSON.stringify(GOOD_REPLY), usage: USAGE, model: "mystery-model" }));
  await handle(body());
  const line = logs.find((l) => l.includes("tokens in="));
  assert.equal(line.includes("est.cost"), false);
});

// ---------- The dev-only simulated behaviors ----------

test("every simulated AI_MODE produces the intended outcome", async () => {
  const expected = {
    "rate-limit": [429, "RATE_LIMITED"],
    timeout: [504, "TIMEOUT"],
    network: [503, "NETWORK"],
    "server-error": [502, "AI_UNAVAILABLE"],
    auth: [500, "SERVER_CONFIG"],
    "bad-json": [502, "INVALID_OUTPUT"],
    "bad-output": [502, "INVALID_OUTPUT"],
    "score-claim": [502, "INVALID_OUTPUT"],
    empty: [502, "INVALID_OUTPUT"],
  };
  for (const mode of MOCK_MODES.filter((m) => m !== "slow")) {
    const handle = createEvaluateHandler({
      evaluate: createMockEvaluate(mode),
      inFlight: new Set(),
      log: { log() {}, error() {} },
    });
    const result = await handle(body());
    if (mode === "ok") {
      assert.equal(result.status, 200);
    } else {
      const [status, code] = expected[mode];
      assert.equal(result.status, status, mode);
      assert.equal(result.body.error.code, code, mode);
    }
  }
});
