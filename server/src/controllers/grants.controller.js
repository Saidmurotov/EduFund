import { db } from "../lib/firebase-admin.js";

const COLLECTION = "opportunities";

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

function computeMatchPercent(prefs, grant) {
  const p = prefs || {};
  const g = grant || {};

  let score = 0;

  const degreePref = norm(p.degree);
  if (degreePref && Array.isArray(g.degree) && g.degree.map(norm).includes(degreePref)) {
    score += 30;
  }

  if (typeof p.gpa === "number" && typeof g.minGPA === "number") {
    if (p.gpa >= g.minGPA) score += 30;
  }

  if (typeof p.ielts === "number" && typeof g.minIELTS === "number") {
    if (p.ielts >= g.minIELTS) score += 20;
  }

  if (Array.isArray(p.countries) && p.countries.length && p.countries.includes(g.country)) {
    score += 20;
  }

  return Math.min(100, score);
}

export async function getAllGrants(req, res) {
  try {
    const snapshot = await db.collection(COLLECTION).get();
    let grants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const countries = asArray(req.query.country);
    const degrees = asArray(req.query.degree).map(norm).filter(Boolean);
    const types = asArray(req.query.type).map(norm).filter(Boolean);
    const search = norm(req.query.search);
    const minTrust = req.query.minTrust ? Number(req.query.minTrust) : null;

    if (countries.length) {
      grants = grants.filter((g) => countries.includes(g.country));
    }

    if (degrees.length) {
      grants = grants.filter((g) => {
        if (!Array.isArray(g.degree)) return false;
        const dg = g.degree.map(norm);
        return degrees.some((d) => dg.includes(d));
      });
    }

    if (types.length) {
      grants = grants.filter((g) => types.includes(norm(g.fundingType)));
    }

    if (typeof minTrust === "number" && !Number.isNaN(minTrust)) {
      grants = grants.filter((g) => (typeof g.trustScore === "number" ? g.trustScore : 0) >= minTrust);
    }

    if (search) {
      grants = grants.filter((g) => {
        const hay = `${g.title || ""} ${g.organization || ""} ${g.country || ""}`.toLowerCase();
        return hay.includes(search);
      });
    }

    // Since route is protected, req.user exists
    if (req.user?.uid) {
      const userDoc = await db.collection("users").doc(req.user.uid).get();
      const prefs = userDoc.exists ? userDoc.data()?.preferences : {};
      grants = grants.map((g) => ({ ...g, matchPercent: computeMatchPercent(prefs, g) }));
    }

    const sort = norm(req.query.sort);
    if (sort === "match") {
      grants = grants.sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));
    } else if (sort === "deadline") {
      grants = grants.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
    } else if (sort === "trust") {
      grants = grants.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    }

    return res.json(grants);
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

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("[getGrantById] Error:", error);
    return res.status(500).json({ message: "Grantni olishda xato yuz berdi." });
  }
}

export async function getMatchedGrantsForUser(req, res) {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi." });
    }

    const prefs = userDoc.data()?.preferences || {};

    const snapshot = await db.collection(COLLECTION).get();
    const grants = snapshot.docs.map((doc) => {
      const data = doc.data();
      const matchPercent = computeMatchPercent(prefs, data);
      return { id: doc.id, matchPercent, ...data };
    });

    const sorted = grants.sort((a, b) => b.matchPercent - a.matchPercent);
    return res.json(sorted);
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
      createdAt: new Date(),
      ...data,
    });

    const created = await docRef.get();
    return res.status(201).json({ id: created.id, ...created.data() });
  } catch (error) {
    console.error("[createGrant] Error:", error);
    return res.status(500).json({ message: "Grant yaratishda xato yuz berdi." });
  }
}

