import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./TenantRequestModal.css";
import RequestAttachmentLink from "../RequestAttachmentLink";
import RequestTimeline from "../ViewRequest/components/RequestTimeline";

const labels = {
  REPAIR: "Repair",
  PERMISSION: "Permission",
  COMPLAINT: "Complaint",
  MOVING_OUT: "Moving Out",
};
const statusLabels = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};
function fileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        fileName: file.name,
        mimeType: file.type,
        data: reader.result,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TenantRequestModal({ request, onClose, onSubmit }) {
  const [category, setCategory] = useState("REPAIR");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [requestedMoveOutDate, setRequestedMoveOutDate] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    function close(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (
      (category === "REPAIR" || category === "COMPLAINT") &&
      selectedFiles.length > 3
    ) {
      setError("Choose up to three images.");
      return;
    }
    if (
      selectedFiles.some(
        (file) =>
          !["image/jpeg", "image/png"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Images must be PNG or JPEG and no larger than 5 MB each.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        category,
        title: title.trim(),
        description: description.trim(),
        reason: reason.trim(),
        requestedMoveOutDate,
        attachments: await Promise.all(selectedFiles.map(fileData)),
      });
    } catch (e) {
      setError(e.response?.data?.message || "Unable to submit request.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div
      className="tenant-request-modal-overlay"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="tenant-request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-request-modal-title"
      >
        <header className="tenant-request-modal-header">
          <div className="tenant-request-modal-heading">
            <div>
              <h2 id="tenant-request-modal-title">
                {request ? request.title : "New Request"}
              </h2>
              {request && (
                <span>
                  {labels[request.category]} · Submitted{" "}
                  {new Intl.DateTimeFormat("en-PH", {
                    dateStyle: "medium",
                  }).format(new Date(request.createdAt))}
                </span>
              )}
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>
        {request ? (
          <div className="tenant-request-modal-details">
            <div className="tenant-request-status-container">
              <span
                className={`tenant-request-status ${request.status.toLowerCase()}`}
              >
                {statusLabels[request.status]}
              </span>
            </div>

            <div className="tenant-request-label-container">
              <p className="tenant-request-label-description">
                Your description:{" "}
                <span className="tenant-request-reply tenant">
                  {request.description}
                </span>
              </p>

              {request.reason && (
                <p className="tenant-request-label-reason">
                  Reason:{" "}
                  <span className="tenant-request-reply admin">
                    {request.reason}
                  </span>
                </p>
              )}
              {request.requestedMoveOutDate && (
                <p className="tenant-request-label-move-out-date">
                  Requested move-out date:{" "}
                  <span className="tenant-request-reply tenant">
                    {request.requestedMoveOutDate}
                  </span>
                </p>
              )}
            </div>

            <div className="tenant-request-label-container">
              {request.adminNotes && (
                <p className="tenant-request-label-admin-notes">
                  Admin note:{" "}
                  <span className="tenant-request-reply admin">
                    {request.adminNotes}
                  </span>
                </p>
              )}
            </div>

            <div className="tenant-request-logs">
              <p className="tenant-request-log-title">REQUEST LOGS</p>
              {!!request.attachments.length && (
                <div className="tenant-request-log-attachments">
                  {request.attachments.map((file) => (
                    <div key={file.id} className="tenant-request-attachment">
                      <RequestAttachmentLink file={file} />
                    </div>
                  ))}
                </div>
              )}
              <RequestTimeline updates={request.updates} />
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label className="tenant-request-form-field">
              <span>
                Request Category <b>*</b>
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {Object.entries(labels).map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="tenant-request-form-field">
              <span>
                Title <b>*</b>
              </span>
              <input
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="tenant-request-form-field">
              <span>
                Description <b>*</b>
              </span>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe your request..."
              />
              <small>{description.length}/500</small>
            </label>
            {category === "MOVING_OUT" && (
              <>
                <label className="tenant-request-form-field">
                  <span>
                    Requested move-out date <b>*</b>
                  </span>
                  <input
                    type="date"
                    required
                    value={requestedMoveOutDate}
                    onChange={(event) =>
                      setRequestedMoveOutDate(event.target.value)
                    }
                  />
                </label>
                <label className="tenant-request-form-field">
                  <span>Reason (Optional)</span>
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
              </>
            )}
            {["REPAIR", "COMPLAINT"].includes(category) && (
              <div className="tenant-request-form-field">
                <span>Attach images (Optional, up to 3)</span>
                <label
                  className="tenant-request-upload"
                  htmlFor="tenant-request-images"
                >
                  <FontAwesomeIcon icon={faImage} />
                  <strong>Choose pictures</strong>
                  <small>PNG or JPG, max 5 MB each</small>
                  <input
                    id="tenant-request-images"
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={(event) =>
                      setSelectedFiles(
                        Array.from(event.target.files ?? []).slice(0, 4),
                      )
                    }
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <ul>
                    {selectedFiles.map((file) => (
                      <li key={`${file.name}-${file.lastModified}`}>
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {error && (
              <p className="record-payment-error" role="alert">
                {error}
              </p>
            )}
            <footer>
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary" disabled={saving}>
                {saving ? "Submitting…" : "Submit Request"}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
