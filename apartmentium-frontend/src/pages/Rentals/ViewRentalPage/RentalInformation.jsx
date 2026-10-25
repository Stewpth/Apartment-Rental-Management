import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { formatMoney, sampleRentalDetails } from "./rentalViewUtils";

export default function RentalInformation({ unit }) {
  return (
    <section className="view-rental-card">
      <h2 className="view-rental-section-title">
        <FontAwesomeIcon icon={faHouse} /> Rental Information
      </h2>
      <div className="view-rental-data-grid">
        <div>
          <span>Unit Number</span>
          <strong>{unit.unit}</strong>
        </div>
        <div>
          <span>Monthly Rent</span>
          <strong>{formatMoney(unit.unit_cost)}</strong>
        </div>
        <div>
          <span>Move-in Date</span>
          <strong>{unit.move_in_date || sampleRentalDetails.moveInDate}</strong>
        </div>
        <div>
          <span>Lease End Date</span>
          <strong>
            {unit.lease_end_date || sampleRentalDetails.leaseEndDate}
          </strong>
        </div>
      </div>
    </section>
  );
}
