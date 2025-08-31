export function Pill({ active = false, className = "", ...props }) {
  return <button {...props} className={`pill ${active ? "pill-active" : ""} ${className}`} />;
}
