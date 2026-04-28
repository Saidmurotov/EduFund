export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_QUERY_CANDIDATE_LIMIT = 500;

const MATCH_CRITERIA = {
  country: (p, g) => {
    const target = asArray(p.targetCountries || p.countries);
    return target.length && target.includes(g.country) ? 30 : 0;
  },
  degree: (p, g) => {
    const userDeg = norm(p.degree);
    const grantDegs = asArray(g.degreeKeys?.length ? g.degreeKeys : g.degree).map(norm);
    if (!userDeg) return 0;
    if (grantDegs.includes("all") || grantDegs.includes("all_degrees")) return 25;
    return grantDegs.includes(userDeg) ? 25 : 0;
  },
  field: (p, g) => {
    const userFields = asArray(p.fields || p.field).map(norm);
    const grantFields = asArray(g.fieldKeys?.length ? g.fieldKeys : g.field || g.fields || g.category).map(norm);
    if (!userFields.length) return 0;
    if (grantFields.includes("all_fields") || grantFields.includes("all")) return 20;
    return userFields.some((f) => grantFields.includes(f) || grantFields.some((gf) => gf.includes(f) || f.includes(gf))) ? 20 : 0;
  },
  gpa: (p, g) => {
    const userGpa = typeof p.gpa === "number" ? p.gpa : Number.parseFloat(p.gpa);
    const minGpa = typeof g.minGPA === "number" ? g.minGPA : Number.parseFloat(g.minGPA ?? g.min_gpa);
    if (Number.isNaN(userGpa) || Number.isNaN(minGpa)) return 0;
    return userGpa >= minGpa ? 15 : 0;
  },
  ielts: (p, g) => {
    const userIelts = typeof p.ielts === "number" ? p.ielts : Number.parseFloat(p.ielts);
    const minIelts = typeof g.minIELTS === "number" ? g.minIELTS : Number.parseFloat(g.minIELTS ?? g.min_ielts);
    if (Number.isNaN(userIelts) || Number.isNaN(minIelts)) return 0;
    return userIelts >= minIelts ? 10 : 0;
  },
};

const GOAL_TYPE_MAP = {
  conference: ["conference"],
  exchange: ["exchange"],
  full_grant: ["scholarship", "full_grant", "full grant"],
  internship: ["internship", "stajirovka"],
  language: ["language_program", "language program"],
  networking: ["conference", "exchange"],
  research: ["research"],
  stajirovka: ["stajirovka", "internship"],
};

const GOAL_FUNDING_MAP = {
  full_grant: ["full"],
};

export function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function norm(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, "_");
}

export function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function parsePositiveInt(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function computeMatchPercent(prefs, grant) {
  const p = prefs || {};
  const g = grant || {};

  const totalScore = Object.values(MATCH_CRITERIA).reduce(
    (acc, criteriaFunc) => acc + criteriaFunc(p, g),
    0
  );
  return Math.min(100, totalScore);
}

export function searchTokensForGrant(grant) {
  const text = [
    grant?.title,
    grant?.organization,
    grant?.country,
    grant?.type,
    grant?.fundingType,
    grant?.category,
    ...asArray(grant?.degree),
    ...asArray(grant?.field || grant?.fields),
  ].join(" ");

  return unique(
    text
      .toLowerCase()
      .replace(/[^a-z0-9' ]+/g, " ")
      .split(/\s+/)
      .flatMap((word) => {
        const clean = word.trim();
        if (clean.length < 2) return [];
        const prefixes = [];
        for (let i = 2; i <= Math.min(clean.length, 12); i += 1) {
          prefixes.push(clean.slice(0, i));
        }
        return [clean, ...prefixes];
      })
  ).slice(0, 500);
}

export function normalizeGrantForIndex(grant) {
  return {
    countryKey: grant?.country || "",
    degreeKeys: unique(asArray(grant?.degree).map(norm)),
    fieldKeys: unique(asArray(grant?.field || grant?.fields || grant?.category).map(norm)),
    typeKey: norm(grant?.type || grant?.category || grant?.opportunityType),
    fundingTypeKeys: unique(asArray(grant?.fundingType || grant?.funding || grant?.fundingTypes).map(norm)),
    searchTokens: searchTokensForGrant(grant),
  };
}

export function grantMatchesFilters(grant, filters) {
  const countries = filters?.countries || [];
  const degrees = filters?.degrees || [];
  const types = filters?.types || [];
  const fundingTypes = filters?.fundingTypes || [];
  const searchTerms = filters?.searchTerms || [];
  const minTrust = filters?.minTrust;

  if (countries.length && !countries.includes(grant.country)) return false;

  if (degrees.length) {
    const grantDegs = asArray(grant.degreeKeys?.length ? grant.degreeKeys : grant.degree).map(norm);
    if (!degrees.some((d) => grantDegs.includes(d))) return false;
  }

  if (types.length) {
    const grantType = grant.typeKey || norm(grant.type || grant.category || grant.opportunityType);
    if (!types.includes(grantType)) return false;
  }

  if (fundingTypes.length) {
    const grantFundingTypes = asArray(
      grant.fundingTypeKeys?.length ? grant.fundingTypeKeys : grant.fundingType || grant.funding || grant.fundingTypes
    ).map(norm);
    if (!fundingTypes.some((fundingType) => grantFundingTypes.includes(fundingType))) return false;
  }

  if (typeof minTrust === "number" && !Number.isNaN(minTrust)) {
    if ((typeof grant.trustScore === "number" ? grant.trustScore : 0) < minTrust) return false;
  }

  if (searchTerms.length) {
    const tokens = asArray(grant.searchTokens);
    if (tokens.length) return searchTerms.some((term) => tokens.includes(term));

    const hay = `${grant.title || ""} ${grant.organization || ""} ${grant.country || ""}`.toLowerCase();
    if (!searchTerms.every((term) => hay.includes(term))) return false;
  }

  return true;
}

export function recommendationSignalsFromPrefs(prefs = {}) {
  const goals = asArray(prefs.goals).map(norm);
  const fieldTerms = unique(asArray(prefs.fields || prefs.field).flatMap((value) => norm(value).split("_")).filter(Boolean));
  const goalTypes = unique(goals.flatMap((goal) => GOAL_TYPE_MAP[goal] || [goal]).map(norm));
  const goalFundingTypes = unique(goals.flatMap((goal) => GOAL_FUNDING_MAP[goal] || []).map(norm));

  return {
    countries: asArray(prefs.targetCountries || prefs.countries).filter(Boolean).slice(0, 10),
    degrees: prefs.degree ? [norm(prefs.degree)] : [],
    fieldTerms: fieldTerms.slice(0, 10),
    types: goalTypes.slice(0, 10),
    fundingTypes: goalFundingTypes.slice(0, 10),
  };
}

export function sortGrants(grants, sort, prefs = {}) {
  const sortKey = norm(sort);
  const list = [...grants];

  if (sortKey === "match") {
    return list.sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));
  }
  if (sortKey === "deadline") {
    return list.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
  }
  if (sortKey === "trust") {
    return list.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
  }
  if (sortKey === "new") {
    return list.sort((a, b) => {
      const aTime = new Date(a.createdAt?._seconds ? a.createdAt._seconds * 1000 : a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt?._seconds ? b.createdAt._seconds * 1000 : b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  const targetCountries = asArray(prefs.targetCountries || prefs.countries);
  return list.sort((a, b) => {
    const aPriority = targetCountries.includes(a.country) ? 1 : 0;
    const bPriority = targetCountries.includes(b.country) ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    return (b.matchPercent || 0) - (a.matchPercent || 0);
  });
}
