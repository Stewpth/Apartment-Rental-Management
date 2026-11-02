const rentalInformation = [
  { label: "Tenant Name", value: "Maria Santos" },
  { label: "Unit Number", value: "101" },
  { label: "Monthly Rent", value: "₱4,500" },
  { label: "Rental Status", value: "Active", isStatus: true },
  { label: "Move-in Date", value: "June 1, 2026" },
];

import { formatMoney } from "../ViewRentalPage/rentalViewUtils";

export default function TenantRentalInformation({ rental }) {
  const rentalInformation = [
    { label: "Tenant Name", value: rental.tenant.fullName },
    { label: "Unit Number", value: rental.unit.unitNumber },
    { label: "Monthly Rent", value: formatMoney(rental.monthlyRent) },
    { label: "Rental Status", value: rental.status.replaceAll("_", " "), isStatus: true },
    { label: "Move-in Date", value: rental.moveInDate },
    { label: "Lease End Date", value: rental.endDate || "—" },
  ];
  return (
    <section className="tenant-rental-information" aria-labelledby="rental-information-title">
      <h2 id="rental-information-title">Rental Information</h2>
      <dl className="tenant-rental-information-list">
        {rentalInformation.map((item) => (
          <div className="tenant-rental-information-row" key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              {item.isStatus ? (
                <span className="tenant-rental-status tenant-rental-status-inline">{item.value}</span>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
