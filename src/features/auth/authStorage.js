// Simple localStorage-backed user store for demo/dev use
// NOTE: This is *not* a server backend. Data stays in the user's browser.

const USERS_KEY = "sl_users";
const CURRENT_KEY = "sl_current_user";

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_KEY);
}

export function findUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email.toLowerCase() === String(email).toLowerCase()) || null;
}

export function addUser(user) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
}

export function updateUser(user) {
  const users = readUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
    writeUsers(users);
  }
}

export function removeUser(id) {
  const users = readUsers().filter(u => u.id !== id);
  writeUsers(users);
}

export function listUsers() {
  // Return a *safe* view of users (no password hashes exposed by default)
  const users = readUsers();
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
  }));
}

export function usersCount() {
  return readUsers().length;
}

export function clearAllUsers() {
  localStorage.removeItem(USERS_KEY);
}

export function exportUsersJSON({ includeHashes = false } = {}) {
  const users = readUsers();
  const safe = includeHashes
    ? users
    : users.map(({ passwordHash, ...rest }) => rest);
  return JSON.stringify(safe, null, 2);
}

export function importUsersJSON(json, { overwrite = false } = {}) {
  let imported;
  try {
    imported = JSON.parse(json);
    if (!Array.isArray(imported)) throw new Error("Invalid JSON format");
  } catch {
    throw new Error("Import failed: invalid JSON");
  }
  const existing = readUsers();

  const merged = overwrite
    ? imported
    : [
      ...existing,
      ...imported.filter(
        imp => !existing.some(ex => (imp.id && ex.id === imp.id) || ex.email?.toLowerCase() === imp.email?.toLowerCase())
      ),
    ];

  writeUsers(merged);
  return merged.length;
}
