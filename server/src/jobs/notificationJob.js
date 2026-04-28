import cron from "node-cron";
import admin from "firebase-admin";
import { db } from "../lib/firebase-admin.js";

const MAX_NOTIFICATION_USERS_SCAN = Number(process.env.MAX_NOTIFICATION_USERS_SCAN || 5000);

export async function runNotificationCheck(now = new Date()) {
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(now.getDate() + 3);

  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(now.getDate() + 7);

  const usersSnap = await db.collection("userProfiles").limit(MAX_NOTIFICATION_USERS_SCAN).get();
  let created = 0;

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;

    const plansSnap = await db.collection("userCalendars").doc(userId).collection("plans").get();
    for (const planDoc of plansSnap.docs) {
      const plan = planDoc.data();
      if (!Array.isArray(plan.steps)) continue;

      for (const step of plan.steps) {
        if (step.completed) continue;

        const endDate = new Date(step.endDate);
        if (Number.isNaN(endDate.getTime())) continue;

        if (isSameDay(endDate, threeDaysLater)) {
          created += await createNotification(userId, {
            type: "deadline_reminder",
            title: "Deadline yaqinlashdi!",
            body: `"${step.title}" bosqichi uchun 3 kun vaqt qoldi.`,
            grantId: plan.grantId,
            stepId: step.id,
          });
        }
      }
    }

    const savedSnap = await db.collection("savedGrants").doc(userId).collection("items").get();
    for (const savedDoc of savedSnap.docs) {
      const savedGrant = savedDoc.data();
      const grant = savedGrant.grantData || savedGrant;
      if (!grant.deadline) continue;

      const deadlineDate = new Date(grant.deadline);
      if (Number.isNaN(deadlineDate.getTime())) continue;

      if (isSameDay(deadlineDate, sevenDaysLater)) {
        created += await createNotification(userId, {
          type: "grant_deadline",
          title: "Grant muddati yaqinlashmoqda",
          body: `"${grant.title}" ariza topshirish muddatiga 7 kun qoldi.`,
          grantId: grant.id || savedDoc.id,
        });
      }
    }
  }

  return { checkedUsers: usersSnap.size, created };
}

export const initNotificationJob = () => {
  if (process.env.ENABLE_EMBEDDED_CRON !== "true") {
    console.log("[NotificationJob] Embedded cron disabled. Use /api/jobs/notifications/daily.");
    return null;
  }

  return cron.schedule("0 9 * * *", async () => {
    console.log("[NotificationJob] Starting daily check...");
    try {
      const result = await runNotificationCheck();
      console.log("[NotificationJob] Finished.", result);
    } catch (error) {
      console.error("[NotificationJob] Error:", error);
    }
  }, { timezone: process.env.NOTIFICATION_TIMEZONE || "Asia/Tashkent" });
};

async function createNotification(userId, data) {
  const today = new Date().toISOString().slice(0, 10);
  const dedupeKey = [
    today,
    data.type || "notification",
    data.grantId || "grant",
    data.stepId || "step",
  ].join("_").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);

  const notifRef = db.collection("notifications").doc(userId).collection("items").doc(dedupeKey);
  const existing = await notifRef.get();
  if (existing.exists) return 0;

  await notifRef.set({
    ...data,
    id: notifRef.id,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return 1;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear()
    && d1.getMonth() === d2.getMonth()
    && d1.getDate() === d2.getDate();
}
