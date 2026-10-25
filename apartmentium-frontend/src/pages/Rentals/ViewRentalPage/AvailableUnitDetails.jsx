import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faHouse,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { formatMoney } from "./rentalViewUtils";

export default function AvailableUnitDetails({ unit, onBack, onAssignTenant }) {
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
        <span className="view-rental-status available">Available</span>
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
          <strong className="view-rental-available-text">Available</strong>
        </div>
      </div>
      <div className="view-rental-vacant-note">
        <strong>
          <FontAwesomeIcon icon={faCircleInfo} /> No Tenant Assigned
        </strong>
        <p>
          This unit is currently vacant. Assign a tenant to start a new rental.
        </p>
      </div>
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
        onClick={onBack}
      >
        Back to Rentals
      </button>
    </section>
  );
}
