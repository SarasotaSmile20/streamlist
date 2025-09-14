import React, { useEffect, useRef } from "react";
import "../app/theme-steampunk.css";

/**
 * GearBurst
 * - Drop-in visual effect to replace PopcornPopper.
 * - Call window.__gearBurst(x,y, {count?, spread?, msg?})
 *   Example: window.__gearBurst(400, 300, { msg: "Searching..." })
 */
export default function GearBurst() {
  const rootRef = useRef(null);

  useEffect(() => {
    function spawn(x, y, opts = {}) {
      const root = rootRef.current;
      if (!root) return;
      const count = Math.max(6, Math.min(24, opts.count ?? 12));
      const spread = opts.spread ?? 90; // degrees
      const msg = opts.msg;

      // Optional banner message
      if (msg) {
        const banner = document.createElement("div");
        banner.textContent = msg;
        banner.style.position = "absolute";
        banner.style.left = `${x - 40}px`;
        banner.style.top = `${y - 40}px`;
        banner.style.padding = ".25rem .5rem";
        banner.style.background = "linear-gradient(135deg, var(--accent), var(--accent-2))";
        banner.style.color = "#23190a";
        banner.style.fontWeight = "900";
        banner.style.borderRadius = "8px";
        banner.style.boxShadow = "0 12px 30px -16px rgba(214,176,106,.45)";
        banner.style.transform = "translateY(0)";
        banner.style.opacity = "1";
        banner.style.transition = "transform .5s ease, opacity .5s ease";
        root.appendChild(banner);
        requestAnimationFrame(() => {
          banner.style.transform = "translateY(-18px)";
          banner.style.opacity = "0";
        });
        setTimeout(() => banner.remove(), 650);
      }

      // Spawn gears (material-icons instead of FontAwesome)
      for (let i = 0; i < count; i++) {
        const el = document.createElement("span");
        el.className = "material-icons gearburst__gear";
        el.textContent = "settings";
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        const angle = ((i / count) * spread - spread / 2) * (Math.PI / 180);
        const speed = 140 + Math.random() * 120;
        const rot = (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 180);
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        el.style.transform = `translate(0px, 0px) rotate(0deg)`;
        el.style.opacity = "1";
        root.appendChild(el);

        // animate
        requestAnimationFrame(() => {
          el.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1), opacity .7s ease";
          el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
          el.style.opacity = "0";
        });

        setTimeout(() => el.remove(), 800);
      }
    }

    window.__gearBurst = spawn;
    return () => { if (window.__gearBurst === spawn) delete window.__gearBurst; };
  }, []);

  return <div ref={rootRef} className="gearburst" aria-hidden="true" />;
}
