import admin from "firebase-admin";
import "./env.js";
import fs from "node:fs";
import path from "node:path";

function normalizeServiceAccount(serviceAccount) {
  if (!serviceAccount?.private_key) return serviceAccount;
  return {
    ...serviceAccount,
    private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
  };
}

function parseServiceAccount(value) {
  if (!value) return null;
  return normalizeServiceAccount(JSON.parse(value));
}

function readLocalServiceAccount() {
  const candidates = [
    path.resolve(process.cwd(), "serviceAccountKey.json"),
    path.resolve(process.cwd(), "server", "serviceAccountKey.json"),
  ];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  return file ? parseServiceAccount(fs.readFileSync(file, "utf8")) : null;
}

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
    return admin.credential.cert(parseServiceAccount(json));
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return admin.credential.cert(parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT));
  }

  const localServiceAccount = readLocalServiceAccount();
  if (localServiceAccount) {
    return admin.credential.cert(localServiceAccount);
  }

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getCredential(),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

