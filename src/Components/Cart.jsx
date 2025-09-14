import list from "../data";
import { useState } from "react";
import { useCart } from "../features/cart/CartContext";
import "./Cart.css";

export default function Cart() {
  const { items, addToCart, removeFromCart, increment, setQuantity, subtotal, clearCart } = useCart();
  const [notice, setNotice] = useState(null);

  const handleAdd = (p) => {
    const res = addToCart(p);
    if (!res.ok) {
      setNotice(res.message || "Unable to add item");
      setTimeout(() => setNotice(null), 3000);
    }
  };

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
          <div className="cart-panel">
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
              <span>Total:</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
          </div>

          <div className="catalog">
            <h2 className="section-title">Subscriptions</h2>
            <WheelCarousel
              items={list.filter((p) => p.service.toLowerCase().includes("subscription"))}
              renderItem={(p) => (
                <ProductCard key={p.id} p={p} onAdd={() => handleAdd(p)} variant="subscription" />
              )}
            />

            <h2 className="section-title">EZTech Accessories</h2>
            <div className="grid">
              {list.filter((p) => !p.service.toLowerCase().includes("subscription")).map((p) => (
                <ProductCard key={p.id} p={p} onAdd={() => handleAdd(p)} />
              ))}
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

function WheelCarousel({ items, renderItem }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="wheel">
      <div className="wheel-track" style={{ transform: `translateX(calc(${index} * -260px))` }}>
        {items.map((it) => (
          <div className="wheel-item" key={it.id}>
            {renderItem(it)}
          </div>
        ))}
      </div>
      <div className="wheel-dots">
        {items.map((_, i) => (
          <button key={i} className={`wheel-dot ${i === index ? "is-active" : ""}`} onClick={() => setIndex(i)} aria-label={`Go to slide ${i+1}`} />
        ))}
      </div>
    </div>
  );
}
