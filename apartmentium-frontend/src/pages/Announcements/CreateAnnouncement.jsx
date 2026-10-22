import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CreateAnnouncement({ onClose, onPublish }) {
  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onPublish({
      title: formData.get("title").trim(),
      content: formData.get("content").trim(),
    });
  }

  return (
    <div
      className="announcement-modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="announcement-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-form-title"
      >
        <header className="announcement-form-header">
          <div>
            <h2 id="announcement-form-title">Create Announcement</h2>
            <p>Create an announcement for your tenants.</p>
          </div>
          <button
            type="button"
            className="announcement-form-close"
            aria-label="Close form"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <label className="announcement-form-field">
            <span>Announcement Title</span>
            <input
              name="title"
              type="text"
              placeholder="Enter announcement title"
              maxLength="120"
              required
              autoFocus
            />
          </label>
          <label className="announcement-form-field">
            <span>Content</span>
            <textarea
              name="content"
              placeholder="Write your announcement here..."
              rows="7"
              required
            />
          </label>
          <footer className="announcement-form-actions">
            <button
              type="button"
              className="announcement-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="announcement-publish-button">
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>Publish Announcement</span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
