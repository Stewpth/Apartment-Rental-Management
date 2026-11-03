import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import RequestAttachmentLink from "../../RequestAttachmentLink";
import { categories, statuses } from "./requestDisplay";

function formatDate(value, options = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat("en-PH", options).format(new Date(value));
}

export default function RequestOverview({ request }) {
  const [categoryLabel, categoryIcon] = categories[request.category] ?? [
    "Request",
    null,
  ];
  const [statusLabel, statusIcon] = statuses[request.status] ?? [
    "Pending",
    null,
  ];

  return (
    <>
      <section className="view-request-header">
        <span className={`request-category ${request.category.toLowerCase()}`}>
          {categoryIcon && <FontAwesomeIcon icon={categoryIcon} />}{" "}
          {categoryLabel}
        </span>
        <h1>{request.title}</h1>
        <p>
          {request.reference} · {formatDate(request.createdAt)}
        </p>
      </section>

      <section className="request-info-container">
        <h2>Request Information</h2>
        <div className="request-info-grid">
          <div>
            <strong>Tenant</strong>
            <span>{request.tenant.fullName}</span>
          </div>
          <div>
            <strong>Unit</strong>
            <span>{request.tenant.unitNumber}</span>
          </div>
          <div>
            <strong>Status</strong>
            <span className={`request-status ${request.status.toLowerCase()}`}>
              {statusIcon && <FontAwesomeIcon icon={statusIcon} />}{" "}
              {statusLabel}
            </span>
          </div>
          <div>
            <strong>Category</strong>
            <span>{categoryLabel}</span>
          </div>
          {request.priority && (
            <div>
              <strong>Priority</strong>
              <span>{request.priority}</span>
            </div>
          )}
        </div>
      </section>

      <section className="request-description-container">
        <h2>Description</h2>
        <p>{request.description}</p>
        {request.reason && (
          <>
            <h3>Reason for moving out</h3>
            <p>{request.reason}</p>
          </>
        )}
        {request.requestedMoveOutDate && (
          <p>Requested move-out date: {request.requestedMoveOutDate}</p>
        )}
      </section>

      {request.adminNotes && (
        <section className="request-description-container">
          <h2>Admin Notes</h2>
          <p>{request.adminNotes}</p>
        </section>
      )}

      {!!request.attachments.length && (
        <section className="request-description-container">
          <h2>
            <FontAwesomeIcon icon={faPaperclip} /> Attachments
          </h2>
          <ul>
            {request.attachments.map((file) => (
              <li key={file.id}>
                <RequestAttachmentLink file={file} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!!request.updates.length && (
        <section className="request-description-container">
          <h2>Updates</h2>
          <div className="view-request-update-list">
            {request.updates.map((update) => {
              const [updateLabel, updateIcon] = statuses[update.status] ?? [
                "Note",
                null,
              ];
              const statusClass = update.status?.toLowerCase() ?? "note";
              return (
                <article className="view-request-update" key={update.id}>
                  <span className={`view-request-update-marker ${statusClass}`} aria-hidden="true">
                    {updateIcon && <FontAwesomeIcon icon={updateIcon} />}
                  </span>
                  <div className="view-request-update-content">
                    <header>
                      <div className="view-request-update-author">
                        <strong>{update.authorName}</strong>
                        <span className={`view-request-update-status ${statusClass}`}>
                          {updateIcon && <FontAwesomeIcon icon={updateIcon} />}
                          {updateLabel}
                        </span>
                      </div>
                      <time>
                        {formatDate(update.createdAt, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </header>
                    {update.message && <p>{update.message}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
