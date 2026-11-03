import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { statuses } from "./requestDisplay";
import "./RequestTimeline.css";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RequestTimeline({ updates = [] }) {
  if (!updates.length) return null;

  return (
    <div className="view-request-update-list">
      {updates.map((update) => {
        const [label, icon] = statuses[update.status] ?? ["Note", null];
        const statusClass = update.status?.toLowerCase() ?? "note";
        return (
          <article className="view-request-update" key={update.id}>
            <span
              className={`view-request-update-marker ${statusClass}`}
              aria-hidden="true"
            >
              {icon && <FontAwesomeIcon icon={icon} />}
            </span>
            <div className="view-request-update-content">
              <header>
                <div className="view-request-update-author">
                  <strong>{update.authorName}</strong>
                  <span className={`view-request-update-status ${statusClass}`}>
                    {icon && <FontAwesomeIcon icon={icon} />}
                    {label}
                  </span>
                </div>
                <time>{formatDate(update.createdAt)}</time>
              </header>
              {update.message && <p>{update.message}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
