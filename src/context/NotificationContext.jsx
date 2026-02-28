import { createContext, useContext, useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import { useAuth } from "../hooks/useAuth.js";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const q = query(
            collection(db, "notifications", user.uid, "items"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setNotifications(items);
            setUnreadCount(items.filter((n) => !n.isRead).length);
        });

        return () => unsub();
    }, [user?.uid]);

    const markAsRead = async (notifId) => {
        if (!user?.uid) return;
        try {
            await updateDoc(doc(db, "notifications", user.uid, "items", notifId), {
                isRead: true,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.uid) return;
        try {
            const unread = notifications.filter((n) => !n.isRead);
            for (const n of unread) {
                await updateDoc(doc(db, "notifications", user.uid, "items", n.id), {
                    isRead: true,
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
