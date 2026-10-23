// Unit tests for aiClient.js using a FAKE client. No network, no key, no tokens.
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateInterview, AiError, MAX_OUTPUT_TOKENS, TIMEOUT_MS } from "../lib/aiClient.js";
import { FEEDBACK_SCHEMA } from "../lib/prompts.js";

// Builds a fake client whose interactions.create records its arguments and
// returns whatever response we give it.
function fakeClient(response) {
  const calls = [];
  return {
    calls,
    interactions: {
      create: async (params, options) => {
        calls.push({ params, options });
        return response;
      },
    },
  };
}

const input = { systemPrompt: "RULES", userMessage: "DATA", schema: FEEDBACK_SCHEMA };

test("sends the rules, data, token cap and schema, with no SDK retries", async () => {
  const client = fakeClient({ status: "completed", output_text: "{}", usage: {} });
  await evaluateInterview(input, client);

  assert.equal(client.calls.length, 1); // exactly one request
  const { params, options } = client.calls[0];
  assert.equal(params.system_instruction, "RULES");
  assert.equal(params.input, "DATA");
  assert.equal(params.generation_config.max_output_tokens, MAX_OUTPUT_TOKENS);
  assert.equal(params.response_format.mime_type, "application/json");
  assert.equal(params.response_format.schema, FEEDBACK_SCHEMA);
  assert.equal(options.maxRetries, 0);
  assert.equal(options.timeout, TIMEOUT_MS);
});

test("returns the text and the token usage", async () => {
  const client = fakeClient({
    status: "completed",
    output_text: '{"ok":true}',
    usage: { total_input_tokens: 900, total_output_tokens: 300, total_thought_tokens: 0 },
  });
  const result = await evaluateInterview(input, client);
  assert.equal(result.text, '{"ok":true}');
  assert.deepEqual(result.usage, { inputTokens: 900, outputTokens: 300, thoughtTokens: 0 });
});

test("rejects a response that did not complete", async () => {
  const client = fakeClient({ status: "incomplete", output_text: '{"title":"cut o', usage: {} });
  await assert.rejects(evaluateInterview(input, client), (e) => e instanceof AiError && e.code === "INCOMPLETE");
});

test("rejects an empty response", async () => {
  for (const output_text of [undefined, "", "   "]) {
    const client = fakeClient({ status: "completed", output_text, usage: {} });
    await assert.rejects(evaluateInterview(input, client), (e) => e instanceof AiError && e.code === "EMPTY");
  }
});

test("the schema asks for exactly the fields the prompt describes", () => {
  assert.deepEqual(Object.keys(FEEDBACK_SCHEMA.properties).sort(), [
    "improvedAnswer", "improvements", "overall", "strengths", "title",
  ]);
  assert.deepEqual([...FEEDBACK_SCHEMA.required].sort(), Object.keys(FEEDBACK_SCHEMA.properties).sort());
});
