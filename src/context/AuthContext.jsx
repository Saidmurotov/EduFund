import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth holatini kuzatish
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Firestore dan user ma'lumotlarini olish
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, ...userDoc.data() });
        } else {
          // Agar user mavjud bo'lsa-yu Firestore da topilmasa (kamdan-kam uchraydi)
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google bilan kirish (Popup orqali)
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Firestore da user mavjudligini tekshirish
      const userRef = doc(db, "users", googleUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userData = {
          userId: googleUser.uid,
          name: googleUser.displayName,
          email: googleUser.email,
          role: "student",
          isPremium: false,
          createdAt: serverTimestamp(),
          preferences: {},
        };
        await setDoc(userRef, userData);
        setUser({ ...googleUser, ...userData });
      }
      return googleUser;
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
      await setDoc(doc(db, "users", newUser.uid), userData);
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
      {!loading && children}
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
