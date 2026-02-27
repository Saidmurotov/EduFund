import { db } from "../lib/firebase-admin.js";

export async function getMe(req, res) {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });

    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: "User not found" });

    return res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("[getMe] Error:", error);
    return res.status(500).json({ message: "Profilni olishda xato yuz berdi." });
  }
}

