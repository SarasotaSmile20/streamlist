export default function LoadingGears({ message = "Loading..." }) {
  return (
    <div className="sl-gears-backdrop" role="status" aria-live="polite">
      <div className="sl-gears">
        <div className="sl-gear sl-gear-lg" />
        <div className="sl-gear sl-gear-md" />
        <div className="sl-gear sl-gear-sm" />
      </div>
      <div className="sl-gears-msg">{message}</div>

      {/* Scoped styles so no global CSS edits required */}
      <style>{`
        .sl-gears-backdrop{
          position:fixed; inset:0; display:grid; place-items:center;
          background:rgba(3,6,12,.65); z-index:9999;
          color:#e5e7eb; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial;
        }
        .sl-gears{position:relative; width:180px; height:180px}
        .sl-gear{position:absolute; border-radius:50%; border:6px solid rgba(255,255,255,.85); box-shadow: inset 0 0 0 6px rgba(255,255,255,.1)}
        .sl-gear-lg{width:120px; height:120px; top:8px; left:8px; animation:sl-spin 1.6s linear infinite}
        .sl-gear-md{width:90px;  height:90px;  top:58px; left:58px; animation:sl-spin-rev 1.2s linear infinite}
        .sl-gear-sm{width:60px;  height:60px;  top:90px; left:18px; animation:sl-spin 1.0s linear infinite}
        .sl-gears-msg{margin-top:14px;text-align:center;font-weight:700}
        @keyframes sl-spin{to{transform:rotate(360deg)}}
        @keyframes sl-spin-rev{to{transform:rotate(-360deg)}}
      `}</style>
    </div>
  );
}
