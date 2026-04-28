import admin from "firebase-admin";
import "../src/lib/env.js";
import { normalizeGrantForIndex } from "../src/lib/grant-utils.js";

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

const db = admin.firestore();
const COLLECTION = "grants";
const BATCH_SIZE = 400;

async function run() {
  const snapshot = await db.collection(COLLECTION).get();
  let batch = db.batch();
  let pending = 0;
  let updated = 0;

  for (const doc of snapshot.docs) {
    batch.set(doc.ref, normalizeGrantForIndex(doc.data()), { merge: true });
    pending += 1;
    updated += 1;

    if (pending >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }

  if (pending) await batch.commit();
  console.log(`Backfilled ${updated} grant index documents.`);
}

run().catch((error) => {
  console.error("Grant index backfill failed:", error);
  process.exit(1);
});
