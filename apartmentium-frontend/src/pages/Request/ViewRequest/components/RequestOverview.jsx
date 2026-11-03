import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faCalendarDays,
  faHashtag,
  faHouse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import RequestAttachmentLink from "../../RequestAttachmentLink";
import { categories, statuses } from "./requestDisplay";
import RequestTimeline from "./RequestTimeline";

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
        <div className="view-request-header-topline">
          <div className="view-request-header-category">
            <span className={`view-request-header-icon ${request.category.toLowerCase()}`}>
              {categoryIcon && <FontAwesomeIcon icon={categoryIcon} />}
            </span>
            <div>
              <span className="view-request-header-kicker">REQUEST OVERVIEW</span>
              <span className="view-request-header-category-label">{categoryLabel}</span>
            </div>
          </div>
          <span className={`view-request-header-status ${request.status.toLowerCase()}`}>
            {statusIcon && <FontAwesomeIcon icon={statusIcon} />}
            {statusLabel}
          </span>
        </div>
        <h1>{request.title}</h1>
        <div className="view-request-header-meta">
          <span><FontAwesomeIcon icon={faHashtag} />{request.reference}</span>
          <span><FontAwesomeIcon icon={faCalendarDays} />Submitted {formatDate(request.createdAt, { dateStyle: "medium" })}</span>
          <span><FontAwesomeIcon icon={faUser} />{request.tenant.fullName}</span>
          <span><FontAwesomeIcon icon={faHouse} />Unit {request.tenant.unitNumber}</span>
        </div>
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
          <RequestTimeline updates={request.updates} />
        </section>
      )}
    </>
  );
}
