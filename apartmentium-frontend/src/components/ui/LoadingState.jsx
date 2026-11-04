import "./LoadingState.css";

export default function LoadingState({ message = "Loading…", variant = "default" }) {
  return (
    <div className={`loading-state loading-state-${variant}`} role="status" aria-live="polite">
      <span className="loading-state-spinner" aria-hidden="true" />
      <span className="loading-state-message">{message}</span>
    </div>
  );
}
