import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
}) {
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
          <p className="view-rental-breadcrumb">RENTALS <span>/</span> VIEW RENTAL</p>
          <h1>Rental details</h1>
        </div>
      </header>

      <div className="view-rental-tenant-layout">
        <div className="view-rental-tenant-summary">
          <div className="view-rental-avatar">
            {unit.tenant_profile_picture ? (
              <img src={unit.tenant_profile_picture} alt={`${tenantName} profile`} />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
          </div>
          <div className="view-rental-tenant-copy">
            <span className="view-rental-eyebrow">TENANT</span>
            <h2>{tenantName}</h2>
            <span className="view-rental-status occupied">Active rental</span>
          </div>
        </div>

        <div className="view-rental-contact-list">
          <div className="view-rental-contact-item">
            <span className="view-rental-contact-icon"><FontAwesomeIcon icon={faEnvelope} /></span>
            <div><span>Email address</span><strong>{email}</strong></div>
          </div>
          <div className="view-rental-contact-item">
            <span className="view-rental-contact-icon"><FontAwesomeIcon icon={faPhone} /></span>
            <div><span>Phone number</span><strong>{contact}</strong></div>
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
          {passwordStatus && <p className="view-rental-password-success" role="status">{passwordStatus}</p>}
          {passwordError && <p className="view-rental-password-error" role="alert">{passwordError}</p>}
        </div>
      </div>
    </section>
  );
}
