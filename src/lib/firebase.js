// src/lib/firebase.js
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { app } from "./firebaseConfig";  // ✅ same folder

// Export the initialized app too, for quick diagnostics
export { app };

export const auth = getAuth(app);
export const db = getFirestore(app);
