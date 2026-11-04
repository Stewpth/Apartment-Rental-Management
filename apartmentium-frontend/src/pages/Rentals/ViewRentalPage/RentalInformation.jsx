import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faHouse,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { formatMoney } from "../../../utils/rentalViewUtils";

export default function RentalInformation({ unit }) {
  return (
    <section className="view-rental-card">
      <header className="view-rental-info-heading">
        <span className="view-rental-section-icon">
          <FontAwesomeIcon icon={faHouse} />
        </span>
        <div>
          <h2>Unit &amp; lease</h2>
          <p>Key information about this rental</p>
        </div>
      </header>
      <div className="view-rental-data-grid">
        <div>
          <span>Unit number</span>
          <strong>{unit.unit}</strong>
        </div>
        <div>
          <span><FontAwesomeIcon icon={faMoneyBillWave} /> Monthly rent</span>
          <strong className="view-rental-rent-value">{formatMoney(unit.unit_cost)}</strong>
        </div>
        <div>
          <span><FontAwesomeIcon icon={faCalendarDays} /> Move-in date</span>
          <strong>{unit.move_in_date || "Not recorded"}</strong>
        </div>
        <div>
          <span><FontAwesomeIcon icon={faCalendarDays} /> Lease end date</span>
          <strong>{unit.lease_end_date || "Not set"}</strong>
        </div>
      </div>
    </section>
  );
}
