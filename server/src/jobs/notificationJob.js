import cron from "node-cron";
import admin from "firebase-admin";

const db = admin.firestore();

export const initNotificationJob = () => {
    // Har kuni soat 09:00 da ishlaydi
    cron.schedule("0 9 * * *", async () => {
        console.log("[NotificationJob] Starting daily check...");
        try {
            const now = new Date();
            const threeDaysLater = new Date();
            threeDaysLater.setDate(now.getDate() + 3);

            const sevenDaysLater = new Date();
            sevenDaysLater.setDate(now.getDate() + 7);

            const usersSnap = await db.collection("userProfiles").get();

            for (const userDoc of usersSnap.docs) {
                const userId = userDoc.id;

                // 1. Check Calendar Plans
                const plansSnap = await db.collection("userCalendars").doc(userId).collection("plans").get();
                for (const planDoc of plansSnap.docs) {
                    const plan = planDoc.data();
                    if (!plan.steps) continue;

                    for (const step of plan.steps) {
                        if (step.completed) continue;

                        const endDate = new Date(step.endDate);
                        // If deadline is in 3 days
                        if (isSameDay(endDate, threeDaysLater)) {
                            await createNotification(userId, {
                                type: 'deadline_reminder',
                                title: '⏰ Deadline yaqinlashdi!',
                                body: `"${step.title}" bosqichi uchun 3 kun vaqt qoldi.`,
                                grantId: plan.grantId,
                                stepId: step.id
                            });
                        }
                    }
                }

                // 2. Check Saved Grants
                const savedSnap = await db.collection("savedGrants").doc(userId).collection("items").get();
                for (const savedDoc of savedSnap.docs) {
                    const grant = savedDoc.data();
                    if (!grant.deadline) continue;

                    const deadlineDate = new Date(grant.deadline);
                    if (isSameDay(deadlineDate, sevenDaysLater)) {
                        await createNotification(userId, {
                            type: 'grant_deadline',
                            title: '📅 Grant muddati yaqinlashmoqda',
                            body: `"${grant.title}" ariza topshirish muddatiga 7 kun qoldi.`,
                            grantId: grant.id || savedDoc.id
                        });
                    }
                }
            }
            console.log("[NotificationJob] Finished.");
        } catch (error) {
            console.error("[NotificationJob] Error:", error);
        }
    });
};

async function createNotification(userId, data) {
    const notifRef = db.collection("notifications").doc(userId).collection("items").doc();
    await notifRef.set({
        ...data,
        id: notifRef.id,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
