// src/lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
// Temporarily comment analytics until login works reliably
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBQjw8HVKV4JzXMuI3aIXzE3XX1HUCINsM",
  authDomain: "streamlist-app-admin.firebaseapp.com",
  projectId: "streamlist-app-admin",
  storageBucket: "streamlist-app-admin.appspot.com", // ✅ fixed domain
  messagingSenderId: "572567972355",
  appId: "1:572567972355:web:890105f622f8f7180efc36",
  // measurementId: "G-52EMVN5Q3T",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app); // enable later

// Default export as fallback
export default app;
