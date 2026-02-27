import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Firebase Admin init:
// - Option A: GOOGLE_APPLICATION_CREDENTIALS points to JSON key file
// - Option B: FIREBASE_SERVICE_ACCOUNT contains JSON string
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

