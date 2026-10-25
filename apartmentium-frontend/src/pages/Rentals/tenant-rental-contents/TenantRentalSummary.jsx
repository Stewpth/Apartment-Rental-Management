const rental = {
  unit: "101",
  building: "Apartmentium Residences",
  monthlyRent: "₱4,500",
  moveInDate: "June 1, 2026",
  status: "Active",
};

export default function TenantRentalSummary() {
  return (
    <section className="tenant-rental-summary" aria-labelledby="assigned-unit-title">
      <div className="tenant-rental-summary-top">
        <div>
          <span className="tenant-rental-eyebrow">YOUR ASSIGNED UNIT</span>
          <h2 id="assigned-unit-title">Unit {rental.unit}</h2>
          <p>{rental.building}</p>
        </div>
        <span className="tenant-rental-status">Active Rental</span>
      </div>
      <div className="tenant-rental-key-details">
        <div>
          <span>Monthly Rent</span>
          <strong>{rental.monthlyRent}</strong>
        </div>
        <div>
          <span>Move-in Date</span>
          <strong>{rental.moveInDate}</strong>
        </div>
      </div>
    </section>
  );
}
