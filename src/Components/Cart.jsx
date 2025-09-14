import list from "../data";
import { useMemo, useState } from "react";
import { useCart } from "../features/cart/CartContext";
import cat from "../assets/cat.gif";
import "./Cart.css";

export default function Cart() {
  const { items, addToCart, removeFromCart, increment, setQuantity, subtotal, clearCart } = useCart();
  const [notice, setNotice] = useState(null);

  // Basic sales tax configuration (7%)
  const TAX_RATE = 0.07;
  const { tax, total } = useMemo(() => {
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    return { tax, total };
  }, [subtotal]);

  const handleAdd = (p) => {
    const res = addToCart(p);
    if (!res.ok) {
      setNotice(res.message || "Unable to add item");
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleCheckout = () => {
    if (!items.length) return;
    // Simple placeholder checkout action
    setNotice(`Checked out successfully. Total charged: $${total.toFixed(2)}`);
    setTimeout(() => setNotice(null), 4000);
    clearCart();
  };

  // Helpers to segment catalog
  const subs = useMemo(
    () => list.filter((p) => p.service.toLowerCase().includes("subscription")),
    []
  );
  const shirts = useMemo(
    () =>
      list.filter(
        (p) =>
          !p.service.toLowerCase().includes("subscription") &&
          (p.service.toLowerCase().includes("shirt") || (p.img || "").toLowerCase().includes("t-shirt"))
      ),
    []
  );

  return (
    <section className="page ledger-page">
      <div className="container-1120">
        <h1 className="title page-heading--nav">
          <span className="material-icons title-icon">shopping_cart</span>
          Satchel
        </h1>

        {notice ? (
          <div className="alert-warn" role="alert">{notice}</div>
        ) : null}

        <div className="cart-grid">
          <div className="catalog">
            <h2 className="section-title">Subscriptions</h2>
            <div className="grid grid--subs">
              {subs.map((p) => (
                <ProductCard key={p.id} p={p} onAdd={() => handleAdd(p)} variant="subscription" />
              ))}
            </div>

            <h2 className="section-title">Shirts</h2>
            <div className="grid">
              {shirts.map((p) => (
                <ProductCard key={p.id} p={p} onAdd={() => handleAdd(p)} />
              ))}
            </div>
          </div>

          <div className="cart-panel">
            <img className="cart-cat" src={cat} alt="Animated cat" />
            <div className="cart-header">
              <h2 className="section-title">Your Cart</h2>
              {items.length ? (
                <button className="btn-gold-outline btn-sm" onClick={clearCart}>Clear</button>
              ) : null}
            </div>

            {items.length === 0 ? (
              <p className="muted">Your satchel is empty. Add something splendid!</p>
            ) : (
              <ul className="cart-list">
                {items.map((it) => (
                  <li key={it.id} className="cart-item">
                    <img className="cart-thumb" src={it.img} alt="" />
                    <div className="cart-main">
                      <div className="cart-title">{it.service}</div>
                      <div className="cart-sub">{it.serviceInfo}</div>
                      <div className="cart-price">${it.price.toFixed(2)}</div>
                    </div>
                    <div className="cart-qty">
                      <button className="btn-qty" onClick={() => increment(it.id, -1)} disabled={it.isSubscription && it.quantity <= 1}>-</button>
                      <input
                        type="number"
                        min={it.isSubscription ? 1 : 0}
                        max={it.isSubscription ? 1 : 999}
                        value={it.quantity}
                        onChange={(e) => setQuantity(it.id, e.target.value)}
                        className="qty-input"
                        aria-label="Quantity"
                      />
                      <button className="btn-qty" onClick={() => increment(it.id, 1)} disabled={it.isSubscription}>+</button>
                    </div>
                    <button className="btn-link remove" onClick={() => removeFromCart(it.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}

            <div className="cart-total">
              <div className="cart-row"><span>Subtotal:</span><strong>${subtotal.toFixed(2)}</strong></div>
              <div className="cart-row"><span>Tax (7%):</span><strong>${tax.toFixed(2)}</strong></div>
              <div className="cart-row cart-row--total"><span>Total:</span><strong>${total.toFixed(2)}</strong></div>
              <button className="btn-gold checkout-btn" disabled={!items.length} onClick={handleCheckout}>Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ p, onAdd, variant }) {
  return (
    <div className={`card ${variant === "subscription" ? "card--subscription" : ""}`}>
      <img className={`card-img ${variant === "subscription" ? "card-img--tint-gold" : ""}`} src={p.img} alt="" />
      <div className="card-body">
        <div className="card-title">{p.service}</div>
        <div className="card-sub">{p.serviceInfo}</div>
        <div className="card-price">${p.price.toFixed(2)}</div>
      </div>
      <div className="card-actions">
        <button className="btn-gold" onClick={onAdd}>Add to Cart</button>
      </div>
    </div>
  );
}

// WheelCarousel removed in favor of inline grids per layout request
