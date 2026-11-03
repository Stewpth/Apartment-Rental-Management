import { useEffect, useState } from "react";

export default function AdminRequestFields({ request, onSave, saving }) {
  const [priority, setPriority] = useState(request.priority || "NORMAL");
  const [notes, setNotes] = useState(request.adminNotes || "");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setPriority(request.priority || "NORMAL");
    setNotes(request.adminNotes || "");
    setEditing(false);
  }, [request]);

  function cancelEdit() {
    setPriority(request.priority || "NORMAL");
    setNotes(request.adminNotes || "");
    setEditing(false);
  }

  async function saveReview(event) {
    event.preventDefault();
    const saved = await onSave({ priority, adminNotes: notes });
    if (saved) setEditing(false);
  }

  return (
    <form
      className="request-description-container"
      onSubmit={saveReview}
    >
      <h2>Admin Review</h2>
      <label>
        Priority{" "}
        <select
          value={priority}
          disabled={!editing || saving}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </label>
      <label>
        Admin response or notes{" "}
        <textarea
          maxLength={2000}
          value={notes}
          disabled={!editing || saving}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      {!editing ? (
        <button
          type="button"
          className="request-btn review-edit"
          disabled={saving}
          onClick={() => setEditing(true)}
        >
          Edit Review Details
        </button>
      ) : (
        <div className="admin-review-actions">
          <button
            type="button"
            className="request-btn review-cancel"
            disabled={saving}
            onClick={cancelEdit}
          >
            Cancel
          </button>
          <button type="submit" className="request-btn accept" disabled={saving}>
            {saving ? "Saving…" : "Save Review Details"}
          </button>
        </div>
      )}
    </form>
  );
}
