import { useEffect, useMemo, useReducer } from "react";
import { loadVersioned, saveVersioned } from "../utils/storage";

export const STORAGE_KEY = "streamlist.items.v1";

// Next numeric string id based on existing items
const getNextId = (list) => {
  if (!Array.isArray(list) || list.length === 0) return "1";
  const maxId = list.reduce((max, i) => {
    const n = parseInt(i.id, 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return String(maxId + 1);
};

function makeItemWithId(id, title, genre = "") {
  return {
    id,
    title: String(title || "").trim(),
    genre: String(genre || "").trim(),
    completed: false,
    createdAt: Date.now(),
    completedAt: null,
  };
}

// Normalize title for duplicate checks
const normalizeTitle = (t) =>
  String(t || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

// Pure, testable reducer
function listReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const t = action.title?.trim();
      if (!t) return state;
      // Prevent duplicates by normalized title
      const key = normalizeTitle(t);
      const exists = state.some((i) => normalizeTitle(i.title) === key);
      if (exists) return state;
      const nextId = getNextId(state);
      return [makeItemWithId(nextId, t, action.genre), ...state];
    }
    case "TOGGLE":
      // set completedAt when checking; clear when unchecking
      return state.map((i) =>
        i.id === action.id
          ? {
              ...i,
              completed: !i.completed,
              completedAt: !i.completed ? Date.now() : null,
            }
          : i
      );
    case "EDIT": {
      // title: only update if provided and non-empty after trim
      const hasTitle = typeof action.title === "string";
      const nt = hasTitle ? action.title.trim() : undefined;

      // genre: update even if empty string (allows clearing)
      const hasGenre = typeof action.genre !== "undefined";
      const ng = hasGenre ? String(action.genre).trim() : undefined;

      return state.map((i) => {
        if (i.id !== action.id) return i;
        return {
          ...i,
          ...(hasTitle && nt ? { title: nt } : {}),
          ...(hasGenre ? { genre: ng } : {}),
        };
      });
    }
    case "DELETE":
      return state.filter((i) => i.id !== action.id);
    case "CLEAR_DONE":
      return state.filter((i) => !i.completed);
    case "REPLACE":
      // used by import flows after merge
      return Array.isArray(action.items) ? action.items : state;
    default:
      return state;
  }
}

// Optional migration to normalize missing fields
function migrate(data) {
  const normalize = (it) => {
    const completedAt =
      typeof it.completedAt === "number"
        ? it.completedAt
        : it.completed
        ? Date.now()
        : null;
    const genre = typeof it.genre === "string" ? it.genre : "";
    return { ...it, completedAt, genre };
  };

  if (Array.isArray(data)) {
    return { version: 1, items: data.map(normalize) };
  }
  if (data && Array.isArray(data.items)) {
    return { ...data, items: data.items.map(normalize) };
  }
  return data;
}

export function usePersistentList() {
  const initial = loadVersioned(
    STORAGE_KEY,
    { version: 1, items: [] },
    migrate
  ).items;

  const [items, dispatch] = useReducer(listReducer, initial);

  useEffect(() => {
    saveVersioned(STORAGE_KEY, { version: 1, items });
  }, [items]);

  const remaining = useMemo(
    () => items.filter((i) => !i.completed).length,
    [items]
  );

  return { items, remaining, dispatch };
}
