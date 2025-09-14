import { createContext, useContext, useMemo } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";

const CartContext = createContext(null);

const STORAGE_KEY = "eztech.cart.v1";

function isSubscriptionProduct(p) {
  // Classify subscriptions by name containing "Subscription"
  return typeof p?.service === "string" && p.service.toLowerCase().includes("subscription");
}

export function CartProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, { items: [] });

  const addToCart = (product) => {
    if (!product) return { ok: false, message: "No product" };
    const sub = isSubscriptionProduct(product);
    const items = Array.isArray(state.items) ? state.items : [];

    if (sub && items.some((i) => i.isSubscription)) {
      return { ok: false, message: "Only one subscription can be added at a time." };
    }

    const existingIndex = items.findIndex((i) => i.id === product.id);
    const nextItems = [...items];
    if (existingIndex >= 0) {
      // Increment quantity for accessories; for subs keep at 1
      const existing = nextItems[existingIndex];
      const nextQty = existing.isSubscription ? 1 : existing.quantity + 1;
      nextItems[existingIndex] = { ...existing, quantity: nextQty };
    } else {
      nextItems.push({
        id: product.id,
        service: product.service,
        serviceInfo: product.serviceInfo,
        price: product.price,
        img: product.img,
        isSubscription: sub,
        quantity: 1,
      });
    }
    setState({ items: nextItems });
    return { ok: true };
  };

  const removeFromCart = (id) => {
    const items = (state.items || []).filter((i) => i.id !== id);
    setState({ items });
  };

  const setQuantity = (id, qty) => {
    const q = Math.max(0, Math.floor(Number(qty) || 0));
    let items = Array.isArray(state.items) ? [...state.items] : [];
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const item = items[idx];
    const maxQty = item.isSubscription ? 1 : 999;
    const newQty = Math.min(maxQty, q);
    if (newQty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      items[idx] = { ...item, quantity: newQty };
    }
    setState({ items });
  };

  const increment = (id, delta) => {
    const items = Array.isArray(state.items) ? [...state.items] : [];
    const idx = items.findIndex((i) => i.id === id);
    if (idx < 0) return;
    const item = items[idx];
    const next = item.isSubscription ? 1 : Math.max(0, (item.quantity || 0) + delta);
    if (next <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = { ...item, quantity: next };
    }
    setState({ items });
  };

  const clearCart = () => setState({ items: [] });

  const totals = useMemo(() => {
    const items = Array.isArray(state.items) ? state.items : [];
    const count = items.reduce((n, i) => n + (i.quantity || 0), 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * (i.quantity || 0), 0);
    return { count, subtotal };
  }, [state.items]);

  const value = useMemo(
    () => ({
      items: Array.isArray(state.items) ? state.items : [],
      addToCart,
      removeFromCart,
      setQuantity,
      increment,
      clearCart,
      ...totals,
    }),
    [state.items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

