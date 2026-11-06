import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faHouse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { formatMoney } from "../../../utils/rentalViewUtils";

export default function AvailableUnitDetails({
  unit,
  onBack,
  onAssignTenant,
  onSetMaintenanceStatus,
  onSetAvailableStatus,
  settingMaintenance,
  settingAvailable,
  maintenanceStatus,
  maintenanceError,
}) {
  const isMaintenance = unit.isMaintenance;

  return (
    <section className="view-rental-card view-rental-unit-card">
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
          <h1>View Unit Details</h1>
          <p>Rentals / Unit Details</p>
        </div>
        <span
          className={`view-rental-status ${isMaintenance ? "maintenance" : "available"}`}
        >
          {isMaintenance ? "Maintenance" : "Available"}
        </span>
      </header>
      <div className="view-rental-unit-intro">
        <FontAwesomeIcon icon={faHouse} />
        <div>
          <h2>{unit.unit}</h2>
          <p>Apartment Unit</p>
        </div>
      </div>
      <div className="view-rental-unit-info">
        <div>
          <span>Monthly Rent</span>
          <strong>{formatMoney(unit.unit_cost)}</strong>
        </div>
        <div>
          <span>Rental Status</span>
          <strong
            className={
              isMaintenance
                ? "view-rental-maintenance-text"
                : "view-rental-available-text"
            }
          >
            {isMaintenance ? "Maintenance" : "Available"}
          </strong>
        </div>
      </div>
      <div className="view-rental-vacant-note">
        <strong>
          <FontAwesomeIcon icon={faCircleInfo} />
          {isMaintenance ? "Unit Under Maintenance" : "No Tenant Assigned"}
        </strong>
        <p>
          {isMaintenance
            ? "This unit is under maintenance and cannot be assigned to a tenant."
            : "This unit is currently vacant. Assign a tenant to start a new rental."}
        </p>
      </div>
      <section className="view-rental-unit-actions">
        {!isMaintenance && (
          <>
            <button
              type="button"
              className="view-rental-primary-button"
              onClick={onAssignTenant}
            >
              <FontAwesomeIcon icon={faUser} /> Assign Tenant
            </button>
            <button
              type="button"
              className="view-rental-secondary-button"
              onClick={onSetMaintenanceStatus}
              disabled={settingMaintenance}
            >
              {settingMaintenance
                ? "Setting maintenance status..."
                : "Set Maintenance Status"}
            </button>
          </>
        )}
        {isMaintenance && (
          <button
            type="button"
            className="view-rental-primary-button"
            onClick={onSetAvailableStatus}
            disabled={settingAvailable}
          >
            {settingAvailable ? "Marking available..." : "Mark as Available"}
          </button>
        )}
        {maintenanceStatus && (
          <p className="view-rental-password-success" role="status">
            {maintenanceStatus}
          </p>
        )}
        {maintenanceError && (
          <p className="view-rental-password-error" role="alert">
            {maintenanceError}
          </p>
        )}
      </section>
    </section>
  );
}
