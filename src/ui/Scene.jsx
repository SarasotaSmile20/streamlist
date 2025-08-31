export function Scene({ size = "lg", className = "", children }) {
  const container =
    size === "sm" ? "container-sm" :
      size === "md" ? "container-md" : "container-lg";
  return <main className={`scene ${container} py-8 ${className}`}>{children}</main>;
}
