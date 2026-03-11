import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDG2u4PDV1t0c984spcrhtj7jSdeA6FS6k",
  authDomain: "edufund-ai.firebaseapp.com",
  projectId: "edufund-ai",
  storageBucket: "edufund-ai.firebasestorage.app",
  messagingSenderId: "286765347572",
  appId: "1:286765347572:web:3fB6714f4d9833a11324a1",
  measurementId: "G-WX8GWFRGMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
