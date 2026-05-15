import { auth, db } from "../lib/firebase-admin.js";

async function attachUser(req, token) {
  const decoded = await auth.verifyIdToken(token);
  const userSnap = await db.collection("userProfiles").doc(decoded.uid).get();
  const userData = userSnap.exists ? userSnap.data() : {};

  req.user = {
    uid: decoded.uid,
    email: decoded.email,
    role: userData.role || "student",
    isPremium: Boolean(userData.isPremium),
  };
}

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Authorization header required" });
    }

    await attachUser(req, token);
    return next();
  } catch (error) {
    console.error("[verifyToken] Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

async function optionalVerifyToken(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");
    if (token) {
      await attachUser(req, token);
    }
  } catch (error) {
    console.warn("[optionalVerifyToken] Ignoring invalid token:", error.message);
  }
  return next();
}

function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Faqat admin uchun ruxsat." });
  }
  return next();
}

export { verifyToken, optionalVerifyToken, isAdmin };
