const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } = require("firebase/firestore");
const { getDatabase } = require("firebase/database"); // 🔴 Pastikan ini ada

// Konfigurasi Firebase (Ganti dengan milikmu)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL, // Tambahkan ini jika pakai Realtime DB
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore
const rtdb = getDatabase(app); // Realtime Database

module.exports = { db, collection, addDoc, getDocs, query, where, updateDoc, doc };
