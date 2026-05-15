import { db } from "../lib/firebase-admin.js";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_QUERY_CANDIDATE_LIMIT,
  MAX_PAGE_SIZE,
  asArray,
  computeMatchPercent,
  grantMatchesFilters,
  norm,
  normalizeGrantForIndex,
  parsePositiveInt,
  recommendationSignalsFromPrefs,
  sortGrants,
  unique,
} from "../lib/grant-utils.js";

const COLLECTION = "grants";
const MAX_QUERY_CANDIDATES = Number(process.env.MAX_QUERY_CANDIDATES || DEFAULT_QUERY_CANDIDATE_LIMIT);

function canAccessUser(req, userId) {
  return req.user?.uid === userId || req.user?.role === "admin";
}

function encodeCursor(doc) {
  if (!doc) return "";
  return Buffer.from(JSON.stringify({ id: doc.id }), "utf8").toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function parseGrantFilters(query) {
  const searchTerms = unique(norm(query.search).split("_").filter(Boolean)).slice(0, 10);

  return {
    countries: asArray(query.country).filter(Boolean).slice(0, 10),
    degrees: asArray(query.degree).map(norm).filter(Boolean).slice(0, 10),
    types: asArray(query.type).map(norm).filter(Boolean).slice(0, 10),
    fundingTypes: asArray(query.fundingType).map(norm).filter(Boolean).slice(0, 10),
    searchTerms,
    minTrust: query.minTrust ? Number(query.minTrust) : null,
  };
}

function isGrantlarUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "") === "grantlar.uz";
  } catch {
    return false;
  }
}

function stripTags(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlDecode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractOriginalUrl(html, sourceUrl) {
  const source = new URL(sourceUrl);
  const skipHosts = [
    "grantlar.uz",
    "facebook.com",
    "twitter.com",
    "x.com",
    "t.me",
    "telegram.me",
    "instagram.com",
    "youtube.com",
    "linkedin.com",
    "wa.me",
  ];

  const candidates = [];
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorRe.exec(html))) {
    const attrs = match[1] || "";
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch) continue;

    const rawHref = htmlDecode(hrefMatch[1]).trim();
    if (!rawHref || rawHref.startsWith("#") || /^(mailto|tel|javascript):/i.test(rawHref)) continue;

    let url;
    try {
      url = new URL(rawHref, source);
    } catch {
      continue;
    }

    const host = url.hostname.replace(/^www\./, "");
    if (skipHosts.some((skip) => host === skip || host.endsWith(`.${skip}`))) continue;

    const text = stripTags(match[2]).toLowerCase();
    const href = url.href.toLowerCase();
    let score = 1;

    if (/(apply|application|register|registration|official|website)/i.test(`${text} ${href}`)) score += 10;
    if (/(ariza|ro'yxat|royxat|rasmiy|sayt|batafsil|topshirish)/i.test(text)) score += 10;
    if (/\.(pdf|docx?|xlsx?)($|\?)/i.test(url.pathname)) score -= 5;

    candidates.push({ url: url.href, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url || null;
}

function applyUrlFromGrant(grant) {
  return (
    grant?.applicationUrl ||
    grant?.originalUrl ||
    grant?.officialUrl ||
    grant?.applyUrl ||
    grant?.url ||
    grant?.link ||
    null
  );
}

function chooseServerFilter(filters) {
  const options = [
    { field: "searchTokens", op: "array-contains-any", values: filters.searchTerms },
    { field: "degreeKeys", op: "array-contains-any", values: filters.degrees },
    { field: "fundingTypeKeys", op: "array-contains-any", values: filters.fundingTypes },
    { field: "country", op: "in", values: filters.countries },
    { field: "typeKey", op: "in", values: filters.types },
  ];

  return options.find((option) => option.values.length) || null;
}

function getSortConfig(sort) {
  const sortKey = norm(sort);
  if (sortKey === "trust") return { field: "trustScore", direction: "desc", exactOrder: true };
  if (sortKey === "new") return { field: "createdAt", direction: "desc", exactOrder: true };
  return { field: "deadline", direction: "asc", exactOrder: sortKey === "deadline" };
}

async function queryGrantCandidates({ filters, limit, cursor, sort }) {
  const serverFilter = chooseServerFilter(filters);
  const postFilterFields = [];
  const sortConfig = getSortConfig(sort);
  let query = db.collection(COLLECTION);

  if (serverFilter) {
    query = query.where(serverFilter.field, serverFilter.op, serverFilter.values);
  }

  if (typeof filters.minTrust === "number" && !Number.isNaN(filters.minTrust) && sortConfig.field === "trustScore") {
    query = query.where("trustScore", ">=", filters.minTrust);
  } else if (typeof filters.minTrust === "number" && !Number.isNaN(filters.minTrust)) {
    postFilterFields.push("minTrust");
  }

  query = query.orderBy(sortConfig.field, sortConfig.direction).orderBy("__name__");

  const decodedCursor = decodeCursor(cursor);
  if (decodedCursor?.id) {
    const cursorDoc = await db.collection(COLLECTION).doc(decodedCursor.id).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }

  const serverFilteredFields = new Set(serverFilter ? [serverFilter.field] : []);
  if (!serverFilteredFields.has("searchTokens") && filters.searchTerms.length) postFilterFields.push("search");
  if (!serverFilteredFields.has("degreeKeys") && filters.degrees.length) postFilterFields.push("degree");
  if (!serverFilteredFields.has("fundingTypeKeys") && filters.fundingTypes.length) postFilterFields.push("fundingType");
  if (!serverFilteredFields.has("country") && filters.countries.length) postFilterFields.push("country");
  if (!serverFilteredFields.has("typeKey") && filters.types.length) postFilterFields.push("type");

  const filtered = [];
  let lastDoc = null;
  let readCount = 0;
  const chunkSize = Math.min(Math.max(limit * 4, 50), MAX_PAGE_SIZE);

  while (filtered.length < limit && readCount < MAX_QUERY_CANDIDATES) {
    const snapshot = await query.limit(Math.min(chunkSize, MAX_QUERY_CANDIDATES - readCount)).get();
    if (snapshot.empty) break;

    readCount += snapshot.size;
    for (const doc of snapshot.docs) {
      lastDoc = doc;
      const grant = { id: doc.id, ...doc.data() };
      if (grantMatchesFilters(grant, filters)) filtered.push(grant);
      if (filtered.length >= limit) break;
    }

    query = db.collection(COLLECTION);
    if (serverFilter) query = query.where(serverFilter.field, serverFilter.op, serverFilter.values);
    if (typeof filters.minTrust === "number" && !Number.isNaN(filters.minTrust) && sortConfig.field === "trustScore") {
      query = query.where("trustScore", ">=", filters.minTrust);
    }
    query = query.orderBy(sortConfig.field, sortConfig.direction).orderBy("__name__").startAfter(lastDoc);
  }

  return {
    grants: filtered,
    nextCursor: filtered.length ? encodeCursor(lastDoc) : "",
    readCount,
    resultMode: postFilterFields.length ? "indexed_with_post_filter" : "indexed",
    serverFilter: serverFilter?.field || "none",
  };
}

async function queryGrantCandidatesFallback({ filters, limit, sort }) {
  const snapshot = await db.collection(COLLECTION).limit(MAX_QUERY_CANDIDATES).get();
  const grants = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((grant) => grantMatchesFilters(grant, filters));

  return {
    grants: sortGrants(grants, sort).slice(0, limit),
    nextCursor: "",
    readCount: snapshot.size,
    resultMode: "scan_fallback",
    serverFilter: "none",
  };
}

async function queryBySignal({ field, op, values, limit }) {
  if (!values.length) return [];

  const snapshot = await db
    .collection(COLLECTION)
    .where(field, op, values.slice(0, 10))
    .orderBy("trustScore", "desc")
    .orderBy("__name__")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function queryRecommendationCandidates(prefs, limit) {
  const signals = recommendationSignalsFromPrefs(prefs);
  const perSignalLimit = Math.min(MAX_PAGE_SIZE, Math.max(limit * 2, 20));
  const queries = [];

  if (signals.countries.length) {
    queries.push(queryBySignal({
      field: "country",
      op: "in",
      values: signals.countries,
      limit: perSignalLimit,
    }));
  }

  if (signals.degrees.length) {
    queries.push(queryBySignal({
      field: "degreeKeys",
      op: "array-contains-any",
      values: signals.degrees,
      limit: perSignalLimit,
    }));
  }

  if (signals.fieldTerms.length) {
    queries.push(queryBySignal({
      field: "searchTokens",
      op: "array-contains-any",
      values: signals.fieldTerms,
      limit: perSignalLimit,
    }));
  }

  if (signals.types.length) {
    queries.push(queryBySignal({
      field: "typeKey",
      op: "in",
      values: signals.types,
      limit: perSignalLimit,
    }));
  }

  if (signals.fundingTypes.length) {
    queries.push(queryBySignal({
      field: "fundingTypeKeys",
      op: "array-contains-any",
      values: signals.fundingTypes,
      limit: perSignalLimit,
    }));
  }

  if (!queries.length) {
    const snapshot = await db
      .collection(COLLECTION)
      .orderBy("trustScore", "desc")
      .orderBy("__name__")
      .limit(limit)
      .get();
    return {
      candidates: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      signals,
      readMode: "fallback_trust",
    };
  }

  const batches = await Promise.all(queries);
  const uniqueCandidates = new Map();

  for (const batch of batches) {
    for (const grant of batch) {
      uniqueCandidates.set(grant.id, grant);
    }
  }

  return {
    candidates: [...uniqueCandidates.values()],
    signals,
    readMode: "profile_signals",
  };
}

export async function getAllGrants(req, res) {
  try {
    const pageSize = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const filters = parseGrantFilters(req.query);
    const myMatch = String(req.query.myMatch || "").toLowerCase() === "true";
    let queryResult;
    try {
      queryResult = await queryGrantCandidates({
        filters,
        limit: pageSize,
        cursor: req.query.cursor,
        sort: req.query.sort,
      });
    } catch (queryError) {
      console.warn("[getAllGrants] Indexed query failed, using scan fallback:", queryError.message);
      queryResult = await queryGrantCandidatesFallback({
        filters,
        limit: pageSize,
        sort: req.query.sort,
      });
    }

    const { grants, nextCursor, readCount, resultMode, serverFilter } = queryResult;

    // Since route is protected, req.user exists
    let result = grants;
    if (req.user?.uid) {
      const userDoc = await db.collection("userProfiles").doc(req.user.uid).get();
      const prefs = userDoc.exists ? userDoc.data()?.preferences : {};
      result = result.map((g) => ({ ...g, matchPercent: computeMatchPercent(prefs, g) }));
    }

    if (myMatch) {
      result = result.filter((g) => (g.matchPercent || 0) > 0);
    }

    if (norm(req.query.sort) === "match") {
      result = sortGrants(result, "match");
    }

    res.set({
      "X-Page-Size": String(pageSize),
      "X-Next-Cursor": nextCursor,
      "X-Result-Mode": resultMode,
      "X-Server-Filter": serverFilter,
      "X-Read-Count": String(readCount),
    });

    return res.json(result);
  } catch (error) {
    console.error("[getAllGrants] Error:", error);
    return res.status(500).json({ message: "Grantlarni olishda xato yuz berdi." });
  }
}

export async function getGrantById(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Grant topilmadi." });
    }

    const data = doc.data();
    let matchPercent = 0;

    if (req.user?.uid) {
      const userDoc = await db.collection("userProfiles").doc(req.user.uid).get();
      const prefs = userDoc.exists ? userDoc.data()?.preferences : {};
      matchPercent = computeMatchPercent(prefs, data);
    }

    return res.json({ id: doc.id, matchPercent, ...data });
  } catch (error) {
    console.error("[getGrantById] Error:", error);
    return res.status(500).json({ message: "Grantni olishda xato yuz berdi." });
  }
}

export async function getGrantApplyUrl(req, res) {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Grant topilmadi." });
    }

    const grant = { id: doc.id, ...doc.data() };
    const directUrl = applyUrlFromGrant(grant);
    if (directUrl) {
      return res.json({ url: directUrl });
    }

    if (!grant.sourceUrl) {
      return res.status(404).json({ message: "Ariza havolasi topilmadi." });
    }

    if (!isGrantlarUrl(grant.sourceUrl)) {
      return res.json({ url: grant.sourceUrl });
    }

    const response = await fetch(grant.sourceUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 EduFund/1.0",
      },
    });

    if (!response.ok) {
      return res.json({ url: grant.sourceUrl });
    }

    const html = await response.text();
    const originalUrl = extractOriginalUrl(html, grant.sourceUrl);
    if (!originalUrl) {
      return res.json({ url: grant.sourceUrl });
    }

    await docRef.set({ applicationUrl: originalUrl, updatedAt: new Date() }, { merge: true });
    return res.json({ url: originalUrl });
  } catch (error) {
    console.error("[getGrantApplyUrl] Error:", error);
    return res.status(500).json({ message: "Ariza havolasini olishda xato yuz berdi." });
  }
}

export async function getMatchedGrantsForUser(req, res) {
  try {
    const { userId } = req.params;

    if (!canAccessUser(req, userId)) {
      return res.status(403).json({ message: "Boshqa foydalanuvchi grantlarini ko'rish mumkin emas." });
    }

    const userDoc = await db.collection("userProfiles").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi." });
    }

    const prefs = userDoc.data()?.preferences || {};
    const pageSize = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const page = parsePositiveInt(req.query.page, 1);
    const { candidates, signals, readMode } = await queryRecommendationCandidates(
      prefs,
      Math.min(MAX_PAGE_SIZE, Math.max(pageSize * 3, pageSize))
    );

    const matchedGrants = candidates.map((data) => {
      const matchPercent = computeMatchPercent(prefs, data);
      const isPriority = signals.countries.includes(data.country);
      return { ...data, matchPercent, isPriority };
    }).filter((grant) => grant.matchPercent > 0);

    const sorted = sortGrants(matchedGrants, "recommendation", prefs);
    const start = (page - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);

    res.set({
      "X-Total-Count": String(sorted.length),
      "X-Page": String(page),
      "X-Page-Size": String(pageSize),
      "X-Recommendation-Mode": readMode,
    });

    return res.json(paginated);
  } catch (error) {
    console.error("[getMatchedGrantsForUser] Error:", error);
    return res
      .status(500)
      .json({ message: "Mos grantlarni hisoblashda xato yuz berdi." });
  }
}

export async function createGrant(req, res) {
  try {
    const { role } = req.user || {};
    if (role !== "admin" && role !== "partner") {
      return res.status(403).json({
        message: "Faqat admin yoki partner yaratishi mumkin.",
      });
    }

    const data = req.body || {};
    if (!data.title || !data.country) {
      return res
        .status(400)
        .json({ message: "Hech bo'lmaganda title va country kerak." });
    }

    const docRef = await db.collection(COLLECTION).add({
      ...data,
      ...normalizeGrantForIndex(data),
      createdAt: new Date(),
      createdBy: req.user.uid,
    });

    const created = await docRef.get();
    return res.status(201).json({ id: created.id, ...created.data() });
  } catch (error) {
    console.error("[createGrant] Error:", error);
    return res.status(500).json({ message: "Grant yaratishda xato yuz berdi." });
  }
}

