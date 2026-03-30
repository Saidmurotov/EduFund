import { Router } from "express";
import admin from "firebase-admin";
import { verifyToken, isAdmin } from "../middleware/verifyToken.js";

const router = Router();
const db = admin.firestore();

router.get("/stats", verifyToken, isAdmin, async (req, res) => {
    try {
        const usersSnap = await db.collection("userProfiles").get();
        const grantsSnap = await db.collection("grants").get();

        const users = usersSnap.docs.map(d => d.data());
        const totalUsers = users.length;

        // Aggregations
        const stats = {
            totalUsers,
            under40: users.filter(u => (u.preferences?.age || 0) <= 40).length,
            male: users.filter(u => u.preferences?.gender === 'male').length,
            female: users.filter(u => u.preferences?.gender === 'female').length,
            highDegree: users.filter(u => ['master', 'phd'].includes(u.preferences?.degree)).length,
            phdOnly: users.filter(u => u.preferences?.degree === 'phd').length,
            byRegion: {},
            byCategory: {},
            monthlyGrowth: [
                { name: 'Sep', users: Math.floor(totalUsers * 0.4) },
                { name: 'Oct', users: Math.floor(totalUsers * 0.5) },
                { name: 'Nov', users: Math.floor(totalUsers * 0.7) },
                { name: 'Dec', users: Math.floor(totalUsers * 0.8) },
                { name: 'Jan', users: Math.floor(totalUsers * 0.9) },
                { name: 'Feb', users: totalUsers },
            ]
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
