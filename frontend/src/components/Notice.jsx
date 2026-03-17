export default function Notice({ kind = "info", children }) {
  return <div className={`notice notice-${kind}`}>{children}</div>;
}
