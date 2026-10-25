import { faCreditCard, faHouse } from "@fortawesome/free-solid-svg-icons";
import TenantPanel from "./TenantPanel";

import "./RentalOverview.css";

export function RentalOverview() {
  return (
    <TenantPanel title="My rental" icon={faHouse} className="rental-panel">
      <div className="tenant-rental">
        <div className="tenant-building-art" aria-hidden="true">
          <span>APARTMENTIUM</span>
          <div className="building">
            {Array.from({ length: 12 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
        <div className="tenant-rental-details">
          <span className="tenant-muted">Unit</span>
          <strong>101</strong>
          <span className="tenant-muted">Rental status</span>
          <span className="tenant-status active">Active</span>
          <span className="tenant-muted">Monthly rent</span>
          <strong>₱4,500</strong>
          <span className="tenant-muted">Move-in date</span>
          <strong>Jan 15, 2025</strong>
        </div>
      </div>
    </TenantPanel>
  );
}

export function PaymentOverview() {
  return (
    <TenantPanel
      title="Payment overview"
      icon={faCreditCard}
      className="payment-overview"
    >
      <p className="tenant-muted">Next rent payment</p>
      <strong className="tenant-balance">₱4,500</strong>
      <div className="tenant-due">
        <span>
          <small>Due date</small>
          <strong>Nov 5, 2026</strong>
        </span>
        <span className="tenant-status due">Upcoming</span>
      </div>
    </TenantPanel>
  );
}
