// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // 🔹 Firestore
// import { getAuth } from "firebase/auth";            // 🔹 Auth si besoin

const firebaseConfig = {
  apiKey: "AIzaSyAQXVQ7N4b4h1bdBxDHDmKZcYALeGfc6TE",
  authDomain: "light-navigation.firebaseapp.com",
  projectId: "light-navigation",
  storageBucket: "light-navigation.firebasestorage.app",
  messagingSenderId: "964949548097",
  appId: "1:964949548097:web:1eb50007452a5e3ec13ac0",
  measurementId: "G-NCCB8TFCRX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Export Firestore
export const db = getFirestore(app);

// 🔹 Export Auth si besoin
// export const auth = getAuth(app);

export { app };
