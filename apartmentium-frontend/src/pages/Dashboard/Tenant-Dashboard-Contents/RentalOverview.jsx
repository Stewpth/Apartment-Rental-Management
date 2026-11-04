import { faCreditCard, faHouse } from "@fortawesome/free-solid-svg-icons";
import TenantPanel from "./TenantPanel";

import "./RentalOverview.css";
import { NavLink } from "react-router-dom";

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(`${date}T00:00:00Z`))
    : "—";

export function RentalOverview({ rental }) {
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
          {rental ? (
            <>
              <span className="tenant-muted">Unit</span>
              <strong>{rental.unitNumber}</strong>
              <span className="tenant-muted">Rental status</span>
              <span
                className={`tenant-status ${rental.status === "ACTIVE" ? "active" : "ongoing"}`}
              >
                {rental.status === "ACTIVE" ? "Active" : "On leaving"}
              </span>
              <span className="tenant-muted">Monthly rent</span>
              <strong>
                ₱{Number(rental.monthlyRent).toLocaleString("en-PH")}
              </strong>
              <span className="tenant-muted">Move-in date</span>
              <strong>{formatDate(rental.moveInDate)}</strong>
            </>
          ) : (
            <>
              <span className="tenant-muted">No current rental</span>
              <NavLink to="/tenant/rentals">View rental information</NavLink>
            </>
          )}
        </div>
      </div>
    </TenantPanel>
  );
}

export function PaymentOverview({ dashboard = {} }) {
  const dueDate = dashboard.nextDueDate;
  const isOverdue =
    dueDate &&
    new Date(`${dueDate}T00:00:00Z`) <
      new Date(new Date().toISOString().slice(0, 10));
  return (
    <TenantPanel
      title="Payment overview"
      icon={faCreditCard}
      className="payment-overview"
    >
      <p className="tenant-muted">Outstanding balance</p>
      <strong className="tenant-balance">
        ₱{Number(dashboard.totalDue || 0).toLocaleString("en-PH")}
      </strong>
      <div className="tenant-due">
        <span>
          <small>Due date</small>
          <strong>{formatDate(dueDate)}</strong>
        </span>
        <span
          className={`tenant-status ${isOverdue ? "overdue" : dueDate ? "due" : "active"}`}
        >
          {isOverdue ? "Overdue" : dueDate ? "Outstanding" : "Paid"}
        </span>
      </div>
    </TenantPanel>
  );
}
