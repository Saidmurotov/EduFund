// ─── Shared utility functions used across multiple components ───

/**
 * Get degree label from value (e.g. "bachelor" → "Bakalavr").
 */
export function degreeLabel(value) {
    const map = { bachelor: "Bakalavr", master: "Magistr", phd: "PhD" };
    return map[value] || value || "-";
}

/**
 * Extract initials from a name (e.g. "Alisher Saidov" → "AS").
 */
export function initials(name) {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) return "U";
    const first = parts[0]?.[0] || "U";
    const second = parts.length > 1 ? parts[1]?.[0] : "";
    return (first + second).toUpperCase();
}

/**
 * Get country flag emoji from country name.
 */
export function countryFlag(country) {
    const map = {
        Germany: "🇩🇪",
        "South Korea": "🇰🇷",
        USA: "🇺🇸",
        UK: "🇬🇧",
        Austria: "🇦🇹",
        Japan: "🇯🇵",
        China: "🇨🇳",
        France: "🇫🇷",
    };
    return map[country] || "🌍";
}

/**
 * Calculate days until a given date string.
 * Returns null if date is invalid.
 */
export function daysUntil(dateString) {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return null;
    const ms = d.getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
