import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faTimes,
  faUpload,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useState } from "react";
import "./AssignTenantModal.css";

const steps = ["Choose Unit", "Tenant Information", "Account Credentials"];

function money(value) {
  return `₱ ${Number(value || 0).toLocaleString("en-PH")}`;
}

function makeUsername(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

export default function AssignTenantModal({
  availableUnits,
  onCancel,
  onCreate,
}) {
  const [step, setStep] = useState(1);
  const [unitId, setUnitId] = useState(availableUnits[0]?.unit_id || "");
  const [tenant, setTenant] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    profilePicture: "",
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const selectedUnit = useMemo(
    () => availableUnits.find((unit) => unit.unit_id === unitId),
    [availableUnits, unitId],
  );

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  function updateTenant(field, value) {
    setTenant((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateTenant("profilePicture", String(reader.result));
    reader.readAsDataURL(file);
  }

  function continueStep(event) {
    event.preventDefault();
    setError("");
    if (step === 1) {
      if (!selectedUnit)
        return setError("Choose an available unit to continue.");
      setStep(2);
      return;
    }
    if (step === 2) {
      if (
        !tenant.fullName.trim() ||
        !tenant.email.trim() ||
        !tenant.contactNumber.trim()
      ) {
        return setError("Complete all required tenant information.");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email))
        return setError("Enter a valid email address.");
      setUsername(makeUsername(tenant.fullName));
      setStep(3);
    }
  }

  function createTenant(event) {
    event.preventDefault();
    if (!password || password.length < 8)
      return setError("Use a password with at least 8 characters.");
    if (password !== confirmPassword)
      return setError("The passwords do not match.");
    onCreate({ unit: selectedUnit, tenant: { ...tenant, username, password } });
  }

  return (
    <div
      className="assign-tenant-overlay"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <section
        className="assign-tenant-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-tenant-title"
      >
        <header className="assign-tenant-header">
          <div>
            <h2 id="assign-tenant-title">Assign Tenant</h2>
            <p>Create a tenant account and assign a unit.</p>
          </div>
          <button
            type="button"
            className="assign-tenant-close"
            aria-label="Close"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <div className="assign-tenant-steps" aria-label="Assignment progress">
          {steps.map((label, index) => (
            <div
              className={`assign-tenant-step ${step === index + 1 ? "is-current" : ""} ${step > index + 1 ? "is-complete" : ""}`}
              key={label}
            >
              <span />
              {label}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={continueStep} className="assign-tenant-body">
            <div className="assign-tenant-section-title">
              <h3>Choose Unit</h3>
              <p>Select an available unit to assign to the tenant.</p>
            </div>
            <label className="assign-tenant-field">
              Available Unit <b>*</b>
              <select
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
                disabled={!availableUnits.length}
              >
                {availableUnits.length ? (
                  availableUnits.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit}
                    </option>
                  ))
                ) : (
                  <option value="">No available units</option>
                )}
              </select>
            </label>
            {selectedUnit && (
              <div className="assign-unit-preview">
                <div className="assign-unit-preview-top">
                  <span>Selected Unit</span>
                  <b>
                    <FontAwesomeIcon icon={faCheck} /> Available
                  </b>
                </div>
                <h3>{selectedUnit.unit}</h3>
                <div className="assign-unit-rent">
                  <span>Monthly Rent</span>
                  <strong>{money(selectedUnit.unit_cost)}</strong>
                </div>
              </div>
            )}
            {!availableUnits.length && (
              <p className="assign-tenant-error">
                There are no available units to assign.
              </p>
            )}
            {error && (
              <p className="assign-tenant-error" role="alert">
                {error}
              </p>
            )}
            <footer className="assign-tenant-actions">
              <button type="button" className="assign-tenant-back" disabled>
                Back
              </button>
              <button
                type="submit"
                className="assign-tenant-continue"
                disabled={!selectedUnit}
              >
                Continue <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </footer>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={continueStep} className="assign-tenant-body">
            <div className="assign-tenant-section-title">
              <h3>Tenant Information</h3>
              <p>Enter the personal details of the tenant.</p>
            </div>
            <div className="assign-photo-field">
              <span>
                Profile Picture <small>(Optional)</small>
              </span>
              <div className="assign-photo-control">
                <div className="assign-photo-preview">
                  {tenant.profilePicture ? (
                    <img
                      src={tenant.profilePicture}
                      alt="Tenant profile preview"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} />
                  )}
                </div>
                <label className="assign-photo-upload">
                  <FontAwesomeIcon icon={faUpload} /> Upload Picture
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handlePhoto}
                  />
                </label>
                <small>JPG or PNG � Recommended square image</small>
              </div>
            </div>
            <label className="assign-tenant-field">
              Full Name <b>*</b>
              <input
                required
                value={tenant.fullName}
                onChange={(event) =>
                  updateTenant("fullName", event.target.value)
                }
                placeholder="Enter tenant's full name"
              />
            </label>
            <label className="assign-tenant-field">
              Email Address <b>*</b>
              <input
                required
                type="email"
                value={tenant.email}
                onChange={(event) => updateTenant("email", event.target.value)}
                placeholder="e.g. maria@email.com"
              />
              <small>
                Gagamitin ang email na ito para sa OTP verification.
              </small>
            </label>
            <label className="assign-tenant-field">
              Contact Number <b>*</b>
              <input
                required
                type="tel"
                value={tenant.contactNumber}
                onChange={(event) =>
                  updateTenant("contactNumber", event.target.value)
                }
                placeholder="e.g. 09171234567"
              />
            </label>
            {error && (
              <p className="assign-tenant-error" role="alert">
                {error}
              </p>
            )}
            <footer className="assign-tenant-actions">
              <button
                type="button"
                className="assign-tenant-back"
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
              <button type="submit" className="assign-tenant-continue">
                Continue <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </footer>
          </form>
        )}

        {step === 3 && (
          <form
            onSubmit={createTenant}
            className="assign-tenant-body assign-tenant-final"
          >
            <div className="assign-tenant-section-title">
              <h3>Tenant Information</h3>
              <p>Review the tenant details before creating the account.</p>
            </div>
            <div className="assign-tenant-person">
              <div className="assign-photo-preview">
                {tenant.profilePicture ? (
                  <img src={tenant.profilePicture} alt="Tenant profile" />
                ) : (
                  <FontAwesomeIcon icon={faUser} />
                )}
              </div>
              <div>
                <strong>{tenant.fullName}</strong>
                <span>Tenant profile</span>
              </div>
              <em>
                {tenant.profilePicture ? "Profile photo" : "Optional photo"}
              </em>
            </div>
            <div className="assign-tenant-details">
              <div>
                <small>Full Name</small>
                <strong>{tenant.fullName}</strong>
              </div>
              <div>
                <small>Contact Number</small>
                <strong>{tenant.contactNumber}</strong>
              </div>
              <div>
                <small>Email Address</small>
                <strong>{tenant.email}</strong>
              </div>
            </div>
            <div className="assign-tenant-section-title assign-credentials-heading">
              <h3>Account Credentials</h3>
            </div>
            <label className="assign-tenant-field">
              Username
              <input
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="assign-tenant-field">
              Initial Password
              <input
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="At least 8 characters"
              />
            </label>
            <label className="assign-tenant-field">
              Confirm Password
              <input
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                placeholder="Re-enter password"
              />
            </label>
            <div className="assign-rental-summary">
              <h3>Rental Summary</h3>
              <div>
                <span>Assigned Unit</span>
                <strong>{selectedUnit?.unit}</strong>
              </div>
              <div>
                <span>Monthly Rent</span>
                <strong>₱ {money(selectedUnit?.unit_cost)}</strong>
              </div>
            </div>
            {error && (
              <p className="assign-tenant-error" role="alert">
                {error}
              </p>
            )}
            <footer className="assign-tenant-actions">
              <button
                type="button"
                className="assign-tenant-back"
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} /> Back
              </button>
              <button type="submit" className="assign-tenant-continue">
                Create Tenant
              </button>
            </footer>
          </form>
        )}
        <p className="assign-tenant-footnote">
          Interactive UI preview lamang. Sa actual implementation, gagamitin ang
          form para gumawa ng tenant account.
        </p>
      </section>
    </div>
  );
}
