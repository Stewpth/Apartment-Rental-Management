import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import "./EmptyState.css";

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <span className="empty-state-icon" aria-hidden="true">
        <FontAwesomeIcon icon={faFolderOpen} />
      </span>
      <h2 id="empty-state-title">{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className="empty-state-action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}
