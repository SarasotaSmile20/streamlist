// src/hooks/useLocalStorage.js
import { useEffect, useRef, useState } from "react";

export default function useLocalStorage(key, initialValue) {
  const first = useRef(true);
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota/corrupt errors
    }
  }, [key, value]);

  return [value, setValue];
}
