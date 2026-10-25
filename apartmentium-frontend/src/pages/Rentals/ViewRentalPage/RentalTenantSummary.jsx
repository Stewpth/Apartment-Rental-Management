import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser } from "@fortawesome/free-solid-svg-icons";

export default function RentalTenantSummary({
  unit,
  tenantName,
  email,
  contact,
  onBack,
}) {
  return (
    <section className="view-rental-card">
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
          <h1>View Tenant's Rental</h1>
          <p>Rentals / View Rental</p>
        </div>
      </header>
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
        <div>
          <h2>{tenantName}</h2>
          <p>{email}</p>
          <p>{contact}</p>
          <span className="view-rental-status occupied">Occupied</span>
        </div>
      </div>
    </section>
  );
}
