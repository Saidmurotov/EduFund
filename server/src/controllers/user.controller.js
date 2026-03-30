import { db } from "../lib/firebase-admin.js";

export async function getMe(req, res) {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const doc = await db.collection("userProfiles").doc(uid).get();
    if (!doc.exists) {
      return res.json({ id: uid, preferences: {}, role: "student" });
    }

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("[getMe] Error:", error);
    return res.status(500).json({ message: "Profilni olishda xato yuz berdi." });
  }
}

