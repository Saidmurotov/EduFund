import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_HISTORY_ITEMS,
  extractJson,
  normalizeHistory,
  sanitizeCalendarSteps,
  sanitizeRoadmapSteps,
} from "../src/lib/ai-utils.js";

test("extractJson returns the first balanced JSON object and ignores fences", () => {
  const json = extractJson('```json\n{"steps":[{"title":"A {quoted}"}]}\n```\nextra {"bad":true}');
  assert.equal(json, '{"steps":[{"title":"A {quoted}"}]}');
});

test("normalizeHistory keeps only safe roles and recent bounded content", () => {
  const history = Array.from({ length: 12 }, (_, index) => ({
    role: index % 2 ? "assistant" : "system",
    content: "x".repeat(900),
  }));

  const normalized = normalizeHistory(history);
  assert.equal(normalized.length, MAX_HISTORY_ITEMS);
  assert.equal(normalized[0].role, "user");
  assert.equal(normalized.at(-1).role, "assistant");
  assert.equal(normalized[0].content.length, 800);
});

test("sanitizeRoadmapSteps applies defaults and rejects invalid dates/categories", () => {
  const steps = sanitizeRoadmapSteps([
    { title: "", startDate: "tomorrow", endDate: "2026-01-02", category: "hack", completed: 1 },
  ]);

  assert.deepEqual(steps, [
    {
      id: 1,
      title: "Qadam 1",
      description: "",
      startDate: null,
      endDate: "2026-01-02",
      category: "document",
      completed: true,
    },
  ]);
});

test("sanitizeCalendarSteps normalizes invalid priority", () => {
  const steps = sanitizeCalendarSteps([{ title: "Apply", priority: "urgent", category: "submission" }]);
  assert.equal(steps[0].priority, "medium");
  assert.equal(steps[0].category, "submission");
});
