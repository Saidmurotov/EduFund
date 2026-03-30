import { auth, db } from "../lib/firebase-admin.js";

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Authorization header required" });
    }

    const decoded = await auth.verifyIdToken(token);

    const userSnap = await db.collection("userProfiles").doc(decoded.uid).get();
    const userData = userSnap.exists ? userSnap.data() : {};

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: userData.role || "student",
      isPremium: Boolean(userData.isPremium),
    };

    return next();
  } catch (error) {
    console.error("[verifyToken] Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function isAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Faqat admin uchun ruxsat." });
  }
  return next();
}

export { verifyToken, isAdmin };
