import { formatMoney } from "../../../utils/rentalViewUtils";

export default function TenantRentalSummary({ rental }) {
  const unitName = rental.unit?.unitNumber
    ? rental.unit.unitNumber.toLowerCase().startsWith("unit ")
      ? rental.unit.unitNumber
      : `Unit ${rental.unit.unitNumber}`
    : `Unit ${rental.unit}`;

  return (
    <section
      className="tenant-rental-summary"
      aria-labelledby="assigned-unit-title"
    >
      <div className="tenant-rental-summary-top">
        <div>
          <span className="tenant-rental-eyebrow">YOUR ASSIGNED UNIT</span>
          <h2 id="assigned-unit-title">{unitName}</h2>
          <p>{rental.unit?.description || rental.building}</p>
        </div>
        <span className="tenant-rental-status">
          {rental.status === "Active"
            ? "Active Rental"
            : rental.status.replaceAll("_", " ")}
        </span>
      </div>
      <div className="tenant-rental-key-details">
        <div>
          <span>Monthly Rent</span>
          <strong>
            {rental.unit
              ? formatMoney(rental.monthlyRent)
              : rental.monthlyRent}
          </strong>
        </div>
        <div>
          <span>Move-in Date</span>
          <strong>{rental.moveInDate}</strong>
        </div>
      </div>
    </section>
  );
}
