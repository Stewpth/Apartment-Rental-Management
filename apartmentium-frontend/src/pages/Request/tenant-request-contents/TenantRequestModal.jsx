import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./TenantRequestModal.css";
import RequestAttachmentLink from "../RequestAttachmentLink";
import RequestTimeline from "../ViewRequest/components/RequestTimeline";
import {
  getTomorrowInManila,
  isAfterTodayInManila,
} from "../../../utils/manilaDate";

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
  const previewUrls = useRef([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(
    () => () => previewUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  useEffect(() => {
    function close(event) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose, saving]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (
      category === "MOVING_OUT" &&
      !isAfterTodayInManila(requestedMoveOutDate)
    ) {
      setError("Requested move-out date must be tomorrow or later.");
      return;
    }
    if (
      (category === "REPAIR" || category === "COMPLAINT") &&
      selectedFiles.length > 3
    ) {
      setError("Choose up to three images.");
      return;
    }
    if (
      selectedFiles.some(
        ({ file }) =>
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
        attachments: await Promise.all(
          selectedFiles.map(({ file }) => fileData(file)),
        ),
      });
    } catch (e) {
      setError(e.response?.data?.message || "Unable to submit request.");
    } finally {
      setSaving(false);
    }
  }
  function selectImages(event) {
    const files = Array.from(event.target.files ?? []);
    const remainingSlots = 3 - selectedFiles.length;
    event.target.value = "";
    if (files.length > remainingSlots) {
      setError(
        remainingSlots === 0
          ? "You can attach up to 3 images. Remove an image before adding another."
          : `You can attach up to 3 images. Only ${remainingSlots} more ${remainingSlots === 1 ? "image is" : "images are"} allowed.`,
      );
      return;
    }
    const selected = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.push(previewUrl);
      return { file, previewUrl };
    });
    setSelectedFiles((current) => [...current, ...selected]);
    setError("");
  }
  function removeImage(previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrls.current = previewUrls.current.filter(
      (url) => url !== previewUrl,
    );
    setSelectedFiles((files) =>
      files.filter((item) => item.previewUrl !== previewUrl),
    );
    setError("");
  }
  return (
    <div
      className="tenant-request-modal-overlay"
      onClick={(event) =>
        !saving && event.target === event.currentTarget && onClose()
      }
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
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={saving}
          >
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

            <section className="tenant-request-admin-note">
              <h3>Admin Note</h3>
              <p>{request.adminNotes?.trim() || "No admin note yet."}</p>
            </section>

            {!!request.attachments.length && (
              <div className="tenant-request-log-attachments">
                {request.attachments.map((file) => (
                  <div key={file.id} className="tenant-request-attachment">
                    <RequestAttachmentLink file={file} />
                  </div>
                ))}
              </div>
            )}

            <div className="tenant-request-logs">
              <p className="tenant-request-log-title">REQUEST LOGS</p>

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
                className="tenant-request-form-field-input title-input"
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
                    min={getTomorrowInManila()}
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
                  className={`tenant-request-upload${selectedFiles.length >= 3 ? " disabled" : ""}`}
                  htmlFor="tenant-request-images"
                  aria-disabled={selectedFiles.length >= 3}
                >
                  <FontAwesomeIcon icon={faImage} />
                  <strong>
                    {selectedFiles.length >= 3
                      ? "Image limit reached"
                      : "Choose pictures"}
                  </strong>
                  <small>
                    {selectedFiles.length}/3 selected · PNG or JPG, max 5 MB
                    each
                  </small>
                  <input
                    id="tenant-request-images"
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    disabled={selectedFiles.length >= 3}
                    onChange={selectImages}
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <div className="tenant-request-image-previews">
                    {selectedFiles.map(({ file, previewUrl }) => (
                      <figure key={previewUrl}>
                        <img src={previewUrl} alt={`Preview: ${file.name}`} />
                        <figcaption title={file.name}>{file.name}</figcaption>
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          onClick={() => removeImage(previewUrl)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
                <small className="tenant-request-upload-note">
                  Images upload when you submit. Canceling keeps them off the
                  server.
                </small>
              </div>
            )}
            {error && (
              <p className="record-payment-error" role="alert">
                {error}
              </p>
            )}
            <footer>
              <button
                type="button"
                className="secondary"
                onClick={onClose}
                disabled={saving}
              >
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
