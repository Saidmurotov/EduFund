import { auth, db } from "../src/lib/firebase-admin.js";

async function run() {
  const [users, grants] = await Promise.all([
    auth.listUsers(1),
    db.collection("grants").limit(1).get(),
  ]);

  console.log(JSON.stringify({
    status: "ok",
    authReachable: Array.isArray(users.users),
    grantsReadable: typeof grants.size === "number",
    sampleGrantCount: grants.size,
  }, null, 2));
}

run().catch((error) => {
  console.error("Firebase smoke check failed:", error);
  process.exit(1);
});
