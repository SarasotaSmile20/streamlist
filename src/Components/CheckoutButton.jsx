import React from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate("/credit-card")}>
      Checkout
    </button>
  );
}
