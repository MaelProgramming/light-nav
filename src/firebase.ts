// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app} 
