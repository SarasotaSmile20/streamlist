// src/utils/admin.js

import { auth, db } from "lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export const ADMIN_EMAIL = "courtneygreens85@gmail.com";

export function isAdminEmail(email) {
  return String(email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Prefer Firebase Auth state; fall back to legacy localStorage if present
export function getCurrentUserEmail() {
  const em = auth?.currentUser?.email;
  if (em) return em;
  try {
    const raw = localStorage.getItem("sl_user");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.email || null;
  } catch {
    return null;
  }
}

// Legacy local-only reader (kept for fallback/testing). Not used once Firestore is on.
export function readRegisteredAccountsLocal() {
  try {
    const raw = localStorage.getItem("sl_accounts") || "{}";
    const obj = JSON.parse(raw);
    const rows = Object.entries(obj).map(([email, val]) => ({
      email,
      createdAt: val?.createdAt ?? null,
    }));
    return rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch {
    return [];
  }
}

// Firestore-backed reader
export async function readRegisteredAccounts() {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const rows = [];
    snap.forEach((doc) => {
      const d = doc.data() || {};
      rows.push({
        id: doc.id,
        email: d.email || "",
        createdAt: d.createdAt || null,
      });
    });
    return rows;
  } catch (e) {
    console.error("Failed to read users from Firestore", e);
    return [];
  }
}
