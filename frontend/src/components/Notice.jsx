export default function Notice({ kind = "info", children }) {
  const role = kind === "error" ? "alert" : "status";

  return (
    <div className={`notice notice-${kind}`} role={role} aria-live="polite">
      {children}
    </div>
  );
}
