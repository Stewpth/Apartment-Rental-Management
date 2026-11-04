import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CreateAnnouncement({
  announcement = null,
  onClose,
  onPublish,
}) {
  const isEditing = Boolean(announcement);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await onPublish({
        title: formData.get("title").trim(),
        content: formData.get("content").trim(),
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to publish announcement.",
      );
    } finally {
      setSaving(false);
    }
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
            <h2 id="announcement-form-title">
              {isEditing ? "Edit Announcement" : "Create Announcement"}
            </h2>
            <p>
              {isEditing
                ? "Update this announcement for your tenants."
                : "Create an announcement for your tenants."}
            </p>
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
        {error && (
          <p className="announcement-error" role="alert">
            {error}
          </p>
        )}
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
              defaultValue={announcement?.title || ""}
            />
          </label>
          <label className="announcement-form-field">
            <span>Content</span>
            <textarea
              name="content"
              placeholder="Write your announcement here..."
              rows="7"
              maxLength="5000"
              required
              defaultValue={announcement?.content || ""}
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
            <button
              type="submit"
              className="announcement-publish-button"
              disabled={saving}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>
                {saving
                  ? isEditing
                    ? "Saving…"
                    : "Publishing…"
                  : isEditing
                    ? "Save Changes"
                    : "Publish Announcement"}
              </span>
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
