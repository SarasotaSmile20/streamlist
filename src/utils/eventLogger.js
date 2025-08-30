// src/utils/eventLogger.js
const KEY = "streamlist:events";

export function logEvent(type, payload = {}) {
  try {
    const raw = localStorage.getItem(KEY);
    const events = raw ? JSON.parse(raw) : [];
    const record = { id: crypto.randomUUID?.() || String(Date.now()), ts: new Date().toISOString(), type, ...payload };
    events.push(record);
    localStorage.setItem(KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

export function getEvents() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
