import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth holatini kuzatish
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            // Firestore dan user ma'lumotlarini olish
            const userDoc = await getDoc(doc(db, "userProfiles", currentUser.uid));
            if (userDoc.exists()) {
              setUser({ ...currentUser, ...userDoc.data() });
            } else {
              // Agar user mavjud bo'lsa-yu Firestore da topilmasa, uni avtomatik yaratib qo'yamiz
              const defaultData = {
                userId: currentUser.uid,
                name: currentUser.displayName || 'EduFund Foydalanuvchi',
                email: currentUser.email,
                role: "student",
                isPremium: false,
                createdAt: serverTimestamp(),
                preferences: {}
              };
              await setDoc(doc(db, "userProfiles", currentUser.uid), defaultData);
              setUser({ ...currentUser, ...defaultData });
            }
          } catch (err) {
            console.error("Firestore user fetch error:", err);
            setUser(currentUser);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      });

      // Firebase ulanmay qolsa, 5 soniyadan keyin baribir ekranni ochamiz
      const timeout = setTimeout(() => {
        if (loading) {
          console.warn("Firebase Auth uzoq vaqt javob bermadi. Ilovani davom ettiramiz.");
          setLoading(false);
        }
      }, 5000);

      return () => {
        unsubscribe();
        clearTimeout(timeout);
      };
    } catch (err) {
      console.error("Firebase auth ishga tushmadi. .env kalitlarini tekshiring:", err);
      setLoading(false);
    }
  }, []);

  // Google bilan kirish (Popup orqali)
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // auth obyektini edufund-ai.firebaseapp.com domain orqali ishlatish
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      // Firestore da user mavjudligini tekshirish
      const userRef = doc(db, "userProfiles", googleUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData = {
          userId: googleUser.uid,
          name: googleUser.displayName || 'User',
          email: googleUser.email,
          role: "student",
          isPremium: false,
          createdAt: serverTimestamp(),
          preferences: {},
        };
        await setDoc(userRef, userData);
        setUser({ ...googleUser, ...userData });
      }
      return result;
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  // Email/Parol orqali ro'yxatdan o'tish
  const registerWithEmail = async (email, password, name) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Profilni yangilash
      await updateProfile(newUser, { displayName: name });

      const userData = {
        userId: newUser.uid,
        name: name,
        email: email,
        role: "student",
        isPremium: false,
        createdAt: serverTimestamp(),
        preferences: {},
      };

      // Firestore da user yaratish
      await setDoc(doc(db, "userProfiles", newUser.uid), userData);
      setUser({ ...newUser, ...userData });

      return newUser;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  // Email/Parol orqali kirish
  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Chiqish
  const logout = () => {
    return signOut(auth);
  };

  // API so'rovlari uchun ID Token olish
  const getIdToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        logout,
        getIdToken,
      }}
    >
      {loading ? (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <div className="text-white text-xl font-medium mb-2">Ilova yuklanmoqda... (Auth)</div>
          <p className="text-gray-400 text-sm text-center max-w-md">Agar sahifa uzoq vaqt ochilmasa, .env faylida Firebase kalitlari to'g'ri ekanligini tekshiring.</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
