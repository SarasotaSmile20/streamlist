import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function formatCardNumber(value) {
  const digits = (value || "").replace(/\D+/g, "").slice(0, 16);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ");
}

function isValidCardNumber(value) {
  const digits = (value || "").replace(/\s+/g, "");
  return digits.length === 16 && /^\d{16}$/.test(digits);
}

export default function CreditCard() {
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [msg, setMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    nameRef.current?.focus();
    // Pre-fill from storage
    try {
      const raw = localStorage.getItem("sl_card");
      if (raw) {
        const saved = JSON.parse(raw);
        setName(saved.name || "");
        setNumber(formatCardNumber(saved.number || ""));
        setExpiry(saved.expiry || "");
        setCvv(saved.cvv || "");
      }
    } catch {}
  }, []);

  const onNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setNumber(formatted);
  };

  const onExpiryChange = (e) => {
    // Allow MM/YY; auto-insert slash
    const v = e.target.value.replace(/\D+/g, "").slice(0, 4);
    let out = v;
    if (v.length > 2) out = v.slice(0, 2) + "/" + v.slice(2);
    setExpiry(out);
  };

  const onCvvChange = (e) => {
    const v = e.target.value.replace(/\D+/g, "").slice(0, 4);
    setCvv(v);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setMsg("");
    setOkMsg("");

    if (!name.trim()) {
      setMsg("Enter the cardholder name.");
      return;
    }
    if (!isValidCardNumber(number)) {
      setMsg("Card number must be 16 digits (1234 5678 9012 3456).");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setMsg("Enter expiry as MM/YY.");
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setMsg("CVV must be 3–4 digits.");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        number: number.replace(/\s+/g, ""),
        expiry,
        cvv,
        savedAt: Date.now(),
      };
      localStorage.setItem("sl_card", JSON.stringify(payload));
      setOkMsg("Card details saved to this device.");
      // Optionally go back to cart
      setTimeout(() => navigate("/cart"), 800);
    } catch (err) {
      console.error(err);
      setMsg("Could not save details. Check storage permissions.");
    }
  };

  return (
    <section className="page ledger-page">
      <div className="container-1120">
        <h1 className="title page-heading--nav">
          <span className="material-icons title-icon">credit_card</span>
          Payment Details
        </h1>

        <form className="signin-card" onSubmit={onSubmit} style={{ maxWidth: 560 }}>
          <label className="field">
            <span className="field-label">Name on Card</span>
            <input
              ref={nameRef}
              className="field-input"
              type="text"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Card Number</span>
            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={number}
              onChange={onNumberChange}
              aria-describedby="card-help"
              required
            />
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <label className="field" style={{ flex: 1 }}>
              <span className="field-label">Expiry</span>
              <input
                className="field-input"
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={onExpiryChange}
                required
              />
            </label>
            <label className="field" style={{ width: 140 }}>
              <span className="field-label">CVV</span>
              <input
                className="field-input"
                type="password"
                inputMode="numeric"
                placeholder="123"
                value={cvv}
                onChange={onCvvChange}
                required
              />
            </label>
          </div>

          {msg ? (
            <div className="muted" style={{ color: "#f4c2d8", marginTop: 6 }}>{msg}</div>
          ) : null}
          {okMsg ? (
            <div className="muted" style={{ color: "#7dd3fc", marginTop: 6 }}>{okMsg}</div>
          ) : null}

          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <button className="btn-gold" type="submit">Save Card</button>
            <button className="btn-gold-outline" type="button" onClick={() => navigate("/cart")}>
              Back to Cart
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

