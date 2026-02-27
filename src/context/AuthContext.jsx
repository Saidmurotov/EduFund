import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setUser(null);
      setFirebaseUser(null);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setFirebaseUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          userId: fbUser.uid,
          name: fbUser.displayName || "",
          email: fbUser.email,
          role: "student",
          isPremium: false,
          createdAt: serverTimestamp(),
          preferences: {},
        });
      }

      setFirebaseUser(fbUser);
      setUser({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || "",
      });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const loginWithEmail = async (email, password) => {
    if (!auth) throw new Error("Firebase auth not configured");
    const { user: fbUser } = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return fbUser;
  };

  const loginWithGoogle = async () => {
    if (!auth || !db) throw new Error("Firebase not configured");
    const { user: fbUser } = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, "users", fbUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        userId: fbUser.uid,
        name: fbUser.displayName || "",
        email: fbUser.email,
        role: "student",
        isPremium: false,
        createdAt: serverTimestamp(),
        preferences: {},
      });
    }
    return fbUser;
  };

  const registerWithEmail = async (email, password, name) => {
    if (!auth || !db) throw new Error("Firebase not configured");
    const { user: fbUser } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (name) await updateProfile(fbUser, { displayName: name });

    const userRef = doc(db, "users", fbUser.uid);
    await setDoc(userRef, {
      userId: fbUser.uid,
      name: name || "",
      email: fbUser.email,
      role: "student",
      isPremium: false,
      createdAt: serverTimestamp(),
      preferences: {},
    });

    return fbUser;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const getIdToken = async () => {
    if (!firebaseUser) return null;
    return await firebaseUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}

