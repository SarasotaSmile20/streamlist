// src/layouts/AppLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { CartProvider } from "../features/cart/CartContext";
import { Scene } from "ui/Scene";
import GearBurst from "../Components/GearBurst";

/**
 * Shared layout for all post-login routes.
 * - Adds Navbar
 * - Applies landing-style background (gradient + gears, no projector)
 * - Leaves page content to handle centering via .container-1120
 */
export default function AppLayout() {
  return (
    <CartProvider>
      <Navbar />
      <Scene size="lg" className="app-bg-colors">
        {/* Each page (StreamList, Movies, etc.) wraps content in .container-1120 */}
        <Outlet />
        <GearBurst />
      </Scene>
    </CartProvider>
  );
}
