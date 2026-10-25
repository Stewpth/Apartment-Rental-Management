import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faCircleCheck,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import "./AddUnitModal.css";

export default function AddUnitModal({ existingUnits, onCancel, onSave }) {
  const [unitNumber, setUnitNumber] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  function handleSubmit(event) {
    event.preventDefault();
    const normalizedUnit = unitNumber.trim().replace(/^unit\s*/i, "");
    const duplicate = existingUnits.some(
      (unit) =>
        unit.unit.replace(/^unit\s*/i, "").toLowerCase() ===
        normalizedUnit.toLowerCase(),
    );
    if (duplicate) {
      setError("That unit number already exists.");
      return;
    }
    onSave({
      unit_id: `unit-${Date.now()}`,
      tenant_id: null,
      tenant_name: null,
      unit: `Unit ${normalizedUnit}`,
      unit_cost: Number(monthlyRent),
      isAvailable: true,
    });
  }

  return (
    <div
      className="add-unit-modal-overlay"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <section
        className="add-unit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-unit-title"
      >
        <header className="add-unit-modal-header">
          <div className="add-unit-title-group">
            <span className="add-unit-icon">
              <FontAwesomeIcon icon={faBuilding} />
            </span>
            <div>
              <h2 id="add-unit-title">Add New Unit</h2>
              <p>Register a new apartment unit</p>
            </div>
          </div>
          <span className="add-unit-admin-badge">Admin</span>
        </header>
        <form onSubmit={handleSubmit}>
          <label className="add-unit-field">
            <span>
              Unit Number <b>*</b>
            </span>
            <input
              required
              value={unitNumber}
              onChange={(event) => {
                setUnitNumber(event.target.value);
                setError("");
              }}
              placeholder="e.g. Unit 101"
            />
          </label>
          <label className="add-unit-field">
            <span>
              Monthly Rent (₱) <b>*</b>
            </span>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={monthlyRent}
              onChange={(event) => setMonthlyRent(event.target.value)}
              placeholder="e.g. 5000.00"
            />
          </label>
          {error && (
            <p className="add-unit-error" role="alert">
              {error}
            </p>
          )}
          <div className="add-unit-status-info">
            <span className="add-unit-status-label">
              <FontAwesomeIcon icon={faCircleInfo} />
              Initial Unit Status
            </span>
            <strong>
              <FontAwesomeIcon icon={faCircleCheck} />
              Available
            </strong>
            <p>
              A newly created unit is Available by default. Tenant assignment
              will be handled separately.
            </p>
          </div>
          <footer className="add-unit-modal-actions">
            <button
              className="add-unit-cancel"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button className="add-unit-save" type="submit">
              Save Unit
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
