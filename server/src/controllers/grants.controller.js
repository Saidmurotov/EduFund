import { db } from "../lib/firebase-admin.js";

const COLLECTION = "grants";

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function norm(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, '_');
}

const MATCH_CRITERIA = {
  country: (p, g) => {
    const target = asArray(p.targetCountries || p.countries);
    return target.length && target.includes(g.country) ? 30 : 0;
  },
  degree: (p, g) => {
    const userDeg = norm(p.degree);
    const grantDegs = asArray(g.degree).map(norm);
    return userDeg && grantDegs.includes(userDeg) ? 25 : 0;
  },
  field: (p, g) => {
    const userFields = asArray(p.fields || p.field).map(norm);
    const grantFields = asArray(g.field || g.fields).map(norm);
    if (!userFields.length) return 0;
    if (grantFields.includes("all fields") || grantFields.includes("all")) return 20;
    return userFields.some(f => grantFields.includes(f)) ? 20 : 0;
  },
  gpa: (p, g) => {
    const userGpa = typeof p.gpa === "number" ? p.gpa : parseFloat(p.gpa);
    const minGpa = typeof g.minGPA === "number" ? g.minGPA : parseFloat(g.minGPA);
    if (isNaN(userGpa) || isNaN(minGpa)) return 0;
    return userGpa >= minGpa ? 15 : 0;
  },
  ielts: (p, g) => {
    const userIelts = typeof p.ielts === "number" ? p.ielts : parseFloat(p.ielts);
    const minIelts = typeof g.minIELTS === "number" ? g.minIELTS : parseFloat(g.minIELTS);
    if (isNaN(userIelts) || isNaN(minIelts)) return 0;
    return userIelts >= minIelts ? 10 : 0;
  },
};

function computeMatchPercent(prefs, grant) {
  const p = prefs || {};
  const g = grant || {};

  const totalScore = Object.values(MATCH_CRITERIA).reduce((acc, criteriaFunc) => acc + criteriaFunc(p, g), 0);
  return Math.min(100, totalScore);
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
      grants = grants.filter((g) => {
        const gType = norm(g.type || g.fundingType);
        return types.includes(gType);
      });
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
      const userDoc = await db.collection("userProfiles").doc(req.user.uid).get();
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

    const userDoc = await db.collection("userProfiles").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi." });
    }

    const prefs = userDoc.data()?.preferences || {};
    const targetCountries = Array.isArray(prefs.targetCountries)
      ? prefs.targetCountries
      : Array.isArray(prefs.countries)
        ? prefs.countries
        : [];

    const snapshot = await db.collection(COLLECTION).get();
    const grants = snapshot.docs.map((doc) => {
      const data = doc.data();
      const matchPercent = computeMatchPercent(prefs, data);
      const isPriority = targetCountries.includes(data.country);
      return { id: doc.id, matchPercent, isPriority, ...data };
    });

    // Priority grants first, then by matchPercent
    const sorted = grants.sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return b.matchPercent - a.matchPercent;
    });

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

