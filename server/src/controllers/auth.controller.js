import { auth, db } from "../lib/firebase-admin.js";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring." });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Create user profile in Firestore
    const userData = {
      userId: userRecord.uid,
      name,
      email,
      role: "student",
      isPremium: false,
      createdAt: new Date(),
      preferences: {},
    };

    await db.collection("userProfiles").doc(userRecord.uid).set(userData);

    return res.status(201).json({
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz.",
      user: userData
    });
  } catch (error) {
    console.error("[Register] Error:", error);
    return res.status(500).json({ message: error.message || "Xatolik yuz berdi." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email va parol majburiy." });
    }

    const webApiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!webApiKey) {
      return res.status(501).json({
        message: "Server login sozlanmagan. FIREBASE_WEB_API_KEY ni .env ga qo'shing yoki client Firebase Auth ishlating.",
      });
    }

    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${webApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const payload = await firebaseRes.json();
    if (!firebaseRes.ok) {
      return res.status(401).json({ message: "Email yoki parol noto'g'ri." });
    }

    const userRecord = await auth.getUser(payload.localId);

    return res.json({
      message: "Kirish muvaffaqiyatli",
      userId: userRecord.uid,
      token: payload.idToken,
      refreshToken: payload.refreshToken,
      expiresIn: payload.expiresIn,
    });
  } catch (error) {
    console.error("[Login] Error:", error);
    return res.status(401).json({ message: "Email yoki parol noto'g'ri." });
  }
};
