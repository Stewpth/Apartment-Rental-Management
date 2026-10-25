import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./TenantRequestModal.css";

const categoryHelp = {
  Complaint: "Raise a concern or complaint regarding your rental experience.",
  Permission: "Ask the landlord for permission or approval.",
  Repair: "Report a maintenance problem that needs fixing.",
};

const descriptionPlaceholders = {
  Complaint: "Describe your concern or complaint...",
  Permission: "Describe the permission you are requesting...",
  Repair: "Describe the maintenance problem...",
};

export default function TenantRequestModal({ request, onClose, onSubmit }) {
  const [category, setCategory] = useState("Repair");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ category, description: description.trim() });
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
              {request ? (
                <span>
                  {request.category} · Submitted {request.submitted}
                </span>
              ) : (
                <p>Submit a request for your assigned unit.</p>
              )}
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>
        {request ? (
          <div className="tenant-request-modal-details">
            <span className={`tenant-request-status ${request.status}`}>
              {request.status === "not_resolved"
                ? "Not Resolved"
                : request.status === "ongoing"
                  ? "Ongoing"
                  : "Resolved"}
            </span>
            <p>{request.description}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="tenant-request-form-field">
              <span>
                Request Category <b>*</b>
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>Repair</option>
                <option>Permission</option>
                <option>Complaint</option>
              </select>
              <small>{categoryHelp[category]}</small>
            </label>
            <label className="tenant-request-form-field">
              <span>
                Request Description <b>*</b>
              </span>
              <textarea
                required
                maxLength={500}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={descriptionPlaceholders[category]}
              />
              <small className="tenant-request-character-count">
                {description.length}/500
              </small>
            </label>
            <div className="tenant-request-form-field">
              <span>Attach Pictures (Optional)</span>
              <label
                className="tenant-request-upload"
                htmlFor="tenant-request-images"
              >
                <FontAwesomeIcon icon={faImage} />
                <strong>Upload pictures</strong>
                <small>PNG, JPG, or JPEG</small>
                <input
                  id="tenant-request-images"
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={(event) =>
                    setSelectedFiles(Array.from(event.target.files ?? []))
                  }
                />
              </label>
              {selectedFiles.length > 0 && (
                <ul className="tenant-request-selected-files">
                  {selectedFiles.map((file) => (
                    <li key={`${file.name}-${file.lastModified}`}>
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <footer>
              <button type="button" className="secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Submit Request
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
