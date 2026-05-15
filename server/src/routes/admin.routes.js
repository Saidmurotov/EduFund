import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";
import { db } from "../lib/firebase-admin.js";

const router = Router();
const MAX_ADMIN_STATS_SCAN = Number(process.env.MAX_ADMIN_STATS_SCAN || 5000);

function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === "function") return value.toDate();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthlyGrowth(users) {
    const formatter = new Intl.DateTimeFormat("en", { month: "short" });
    const now = new Date();

    return Array.from({ length: 6 }, (_, index) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const usersCount = users.filter((user) => {
            const createdAt = toDate(user.createdAt);
            return createdAt && createdAt.getFullYear() === year && createdAt.getMonth() === month;
        }).length;

        return { name: formatter.format(monthDate), users: usersCount };
    });
}

async function getCollectionCount(collectionName) {
    try {
        const snapshot = await db.collection(collectionName).count().get();
        return snapshot.data().count;
    } catch (error) {
        console.warn(`[admin.stats] Count fallback for ${collectionName}:`, error.message);
        return null;
    }
}

router.get("/stats", verifyToken, isAdmin, async (req, res) => {
    try {
        const [usersSnap, grantsSnap, totalUsersCount] = await Promise.all([
            db.collection("userProfiles").limit(MAX_ADMIN_STATS_SCAN).get(),
            db.collection("grants").limit(MAX_ADMIN_STATS_SCAN).get(),
            getCollectionCount("userProfiles"),
        ]);

        const users = usersSnap.docs.map(d => d.data());
        const totalUsers = totalUsersCount ?? users.length;

        // Aggregations
        const stats = {
            totalUsers,
            under40: users.filter(u => Number(u.preferences?.age) > 0 && Number(u.preferences?.age) <= 40).length,
            male: users.filter(u => u.preferences?.gender === 'male').length,
            female: users.filter(u => u.preferences?.gender === 'female').length,
            highDegree: users.filter(u => ['master', 'phd'].includes(u.preferences?.degree)).length,
            phdOnly: users.filter(u => u.preferences?.degree === 'phd').length,
            byRegion: {},
            byCategory: {},
            monthlyGrowth: getMonthlyGrowth(users),
            sampledUsers: users.length,
            sampledGrants: grantsSnap.size,
        };

        users.forEach(u => {
            const reg = u.preferences?.region || "Noma'lum";
            stats.byRegion[reg] = (stats.byRegion[reg] || 0) + 1;
        });

        const grants = grantsSnap.docs.map(d => d.data());
        grants.forEach(g => {
            const type = g.type || g.fundingType || "Other";
            stats.byCategory[type] = (stats.byCategory[type] || 0) + 1;
        });

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Statistikani yuklashda xato." });
    }
});

export default router;
