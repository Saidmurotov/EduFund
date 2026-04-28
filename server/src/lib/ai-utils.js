export const MAX_MESSAGE_CHARS = 2000;
export const MAX_HISTORY_ITEMS = 8;
export const MAX_HISTORY_CHARS = 800;

const ALLOWED_STEP_CATEGORIES = new Set(["exam", "document", "writing", "submission"]);
const ALLOWED_PRIORITIES = new Set(["high", "medium", "low"]);

export function extractJson(text) {
  const s = String(text || "").replace(/```(?:json)?/gi, "").replace(/```/g, "");
  const start = s.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < s.length; i += 1) {
    const ch = s[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") inString = true;
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) return s.slice(start, i + 1);
  }

  return null;
}

export function truncate(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeHistory(conversationHistory) {
  if (!Array.isArray(conversationHistory)) return [];

  return conversationHistory
    .slice(-MAX_HISTORY_ITEMS)
    .map((m) => {
      const role = m?.role === "assistant" ? "assistant" : "user";
      const content = truncate(m?.content, MAX_HISTORY_CHARS);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

export function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

export function sanitizeRoadmapSteps(steps) {
  if (!Array.isArray(steps)) return [];

  return steps.slice(0, 20).map((step, index) => ({
    id: step?.id ?? index + 1,
    title: truncate(step?.title, 140) || `Qadam ${index + 1}`,
    description: truncate(step?.description, 600),
    startDate: isIsoDate(step?.startDate) ? step.startDate : null,
    endDate: isIsoDate(step?.endDate) ? step.endDate : null,
    category: ALLOWED_STEP_CATEGORIES.has(step?.category) ? step.category : "document",
    completed: Boolean(step?.completed),
  }));
}

export function sanitizeCalendarSteps(steps) {
  if (!Array.isArray(steps)) return [];

  return steps.slice(0, 20).map((step, index) => ({
    id: step?.id ?? index + 1,
    title: truncate(step?.title, 140) || `Qadam ${index + 1}`,
    description: truncate(step?.description, 600),
    startDate: isIsoDate(step?.startDate) ? step.startDate : null,
    endDate: isIsoDate(step?.endDate) ? step.endDate : null,
    category: ALLOWED_STEP_CATEGORIES.has(step?.category) ? step.category : "document",
    priority: ALLOWED_PRIORITIES.has(step?.priority) ? step.priority : "medium",
  }));
}
