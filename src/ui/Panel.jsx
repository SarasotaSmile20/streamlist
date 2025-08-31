export function Panel({ title, actions, level = "lg", className = "", children }) {
  const tl = level === "xl" ? "title-xl" : level === "md" ? "title-md" : "title-lg";
  return (
    <section className={`panel ${className}`}>
      <div className="panel-body">
        {title && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className={tl}>{title}</h1>
              {actions}
            </div>
            <div className="title-underline mb-6" />
          </>
        )}
        {children}
      </div>
    </section>
  );
}
