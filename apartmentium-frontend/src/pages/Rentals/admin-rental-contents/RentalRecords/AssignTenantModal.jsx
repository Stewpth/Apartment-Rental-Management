import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useState } from "react";
import ChooseUnit from "./AssignTenantModal/ChooseUnit";
import TenantInfoForm from "./AssignTenantModal/TenantInfoForm";
import AccountCredentialsModal from "./AssignTenantModal/AccountCredentialsModal";
import "./AssignTenantModal.css";

const steps = ["Choose Unit", "Tenant Information", "Account Credentials"];

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
  initialUnitId,
  onCancel,
  onCreate,
}) {
  const [step, setStep] = useState(1);
  const [unitId, setUnitId] = useState(() =>
    availableUnits.some((unit) => unit.unit_id === initialUnitId)
      ? initialUnitId
      : availableUnits[0]?.unit_id || "",
  );
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
      )
        return setError("Complete all required tenant information.");
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

  function goBack(targetStep) {
    setError("");
    setStep(targetStep);
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
          <ChooseUnit
            availableUnits={availableUnits}
            selectedUnit={selectedUnit}
            unitId={unitId}
            setUnitId={setUnitId}
            error={error}
            onContinue={continueStep}
          />
        )}
        {step === 2 && (
          <TenantInfoForm
            tenant={tenant}
            updateTenant={updateTenant}
            error={error}
            setError={setError}
            onContinue={continueStep}
            onBack={() => goBack(1)}
          />
        )}
        {step === 3 && (
          <AccountCredentialsModal
            tenant={tenant}
            selectedUnit={selectedUnit}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            setError={setError}
            onBack={() => goBack(2)}
            onCreate={createTenant}
          />
        )}
      </section>
    </div>
  );
}
