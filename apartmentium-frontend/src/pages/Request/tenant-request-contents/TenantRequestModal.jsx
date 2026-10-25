import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "./TenantRequestModal.css";

export default function TenantRequestModal({ request, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Repair");
  const [description, setDescription] = useState("");

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ title: title.trim(), category, description: description.trim() });
  }

  return (
    <div className="tenant-request-modal-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="tenant-request-modal" role="dialog" aria-modal="true" aria-labelledby="tenant-request-modal-title">
        <header>
          <div>
            <h2 id="tenant-request-modal-title">{request ? request.title : "New Request"}</h2>
            {request && <span>{request.category} · Submitted {request.submitted}</span>}
          </div>
          <button type="button" aria-label="Close" onClick={onClose}><FontAwesomeIcon icon={faXmark} /></button>
        </header>
        {request ? (
          <div className="tenant-request-modal-details">
            <span className={`tenant-request-status ${request.status}`}>{request.status === "not_resolved" ? "Not Resolved" : request.status === "ongoing" ? "Ongoing" : "Resolved"}</span>
            <p>{request.description}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Request title<input required maxLength="100" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What do you need help with?" /></label>
            <label>Request type<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Repair</option><option>Permission</option></select></label>
            <label>Description<textarea required maxLength="1000" rows="4" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe your request" /></label>
            <footer><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit" className="primary">Submit Request</button></footer>
          </form>
        )}
      </section>
    </div>
  );
}
