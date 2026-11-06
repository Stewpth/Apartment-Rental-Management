import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
  faArrowLeft,
  faEnvelope,
  faPhone,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function RentalTenantSummary({
  unit,
  tenantName,
  email,
  contact,
  onBack,
  onChangePassword,
  changingPassword,
  passwordStatus,
  passwordError,
  accountStatus,
  onActivateTenant,
  activatingTenant,
  activationStatus,
  activationError,
  onResendActivationOtp,
  resendingActivationOtp,
  resendActivationStatus,
  resendActivationError,
}) {
  const [otp, setOtp] = useState("");

  return (
    <section className="view-rental-card view-rental-tenant-card">
      <header className="view-rental-heading">
        <button
          type="button"
          className="view-rental-back-icon"
          onClick={onBack}
          aria-label="Back to rentals"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <p className="view-rental-breadcrumb">
            RENTALS <span>/</span> VIEW RENTAL
          </p>
          <h1>Rental details</h1>
        </div>
      </header>

      <div className="view-rental-tenant-layout">
        <div className="view-rental-tenant-summary">
          <div className="view-rental-avatar">
            {unit.tenant_profile_picture ? (
              <img
                src={unit.tenant_profile_picture}
                alt={`${tenantName} profile`}
              />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
          </div>
          <div className="view-rental-tenant-copy">
            <span className="view-rental-eyebrow">TENANT</span>
            <h2>{tenantName}</h2>
            <span className="view-rental-status occupied">Active rental</span>
            {accountStatus === "PENDING_ACTIVATION" && (
              <span
                className={`view-rental-status ${accountStatus === "ACTIVE" ? "occupied" : "pending"}`}
              >
                Account activated
              </span>
            )}
          </div>
        </div>

        <div className="view-rental-contact-list">
          <div className="view-rental-contact-item">
            <span className="view-rental-contact-icon">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <div>
              <span>Email address</span>
              <strong>{email}</strong>
            </div>
          </div>
          <div className="view-rental-contact-item">
            <span className="view-rental-contact-icon">
              <FontAwesomeIcon icon={faPhone} />
            </span>
            <div>
              <span>Phone number</span>
              <strong>{contact}</strong>
            </div>
          </div>
        </div>

        <div className="view-rental-password-actions">
          <button
            type="button"
            className="view-rental-secondary-button"
            onClick={onChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? "Sending new password..." : "Change Password"}
          </button>
          <p className="view-rental-password-hint">
            A temporary password will be sent to the tenant's email.
          </p>
          {passwordStatus && (
            <p className="view-rental-password-success" role="status">
              {passwordStatus}
            </p>
          )}
          {passwordError && (
            <p className="view-rental-password-error" role="alert">
              {passwordError}
            </p>
          )}
        </div>
      </div>

      {accountStatus === "PENDING_ACTIVATION" && (
        <form
          className="view-rental-activation-form"
          onSubmit={(event) => {
            event.preventDefault();
            onActivateTenant(otp);
          }}
        >
          <div>
            <h3>Activate tenant account</h3>
            <p>Enter the 6-digit OTP sent to {email}.</p>
          </div>
          <input
            aria-label="Tenant activation OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
          />
          <button type="submit" disabled={activatingTenant || otp.length !== 6}>
            {activatingTenant ? "Activating..." : "Activate account"}
          </button>
          <button
            className="view-rental-resend-otp-button"
            type="button"
            onClick={async () => {
              const result = await onResendActivationOtp();
              if (result) setOtp("");
            }}
            disabled={resendingActivationOtp}
          >
            {resendingActivationOtp ? "Resending..." : "Resend OTP"}
          </button>
          {activationStatus && <p role="status">{activationStatus}</p>}
          {activationError && <p role="alert">{activationError}</p>}
          {resendActivationStatus && (
            <p role="status">{resendActivationStatus}</p>
          )}
          {resendActivationError && <p role="alert">{resendActivationError}</p>}
        </form>
      )}
    </section>
  );
}
