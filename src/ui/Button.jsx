export function Button({ variant = "brass", className = "", ...props }) {
  const map = {
    brass: "btn-brass",
    copper: "btn-copper",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };
  return <button {...props} className={`btn ${map[variant]} ${className}`} />;
}
