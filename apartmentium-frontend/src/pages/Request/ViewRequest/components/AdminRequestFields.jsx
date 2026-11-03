import { useEffect, useState } from "react";

export default function AdminRequestFields({ request, onSave, saving }) {
  const [priority, setPriority] = useState(request.priority || "NORMAL");
  const [notes, setNotes] = useState(request.adminNotes || "");

  useEffect(() => {
    setPriority(request.priority || "NORMAL");
    setNotes(request.adminNotes || "");
  }, [request]);

  return (
    <form
      className="request-description-container"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ priority, adminNotes: notes });
      }}
    >
      <h2>Admin Review</h2>
      <label>
        Priority{" "}
        <select
          value={priority}
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
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <button className="request-btn accept" disabled={saving}>
        Save Review Details
      </button>
    </form>
  );
}
