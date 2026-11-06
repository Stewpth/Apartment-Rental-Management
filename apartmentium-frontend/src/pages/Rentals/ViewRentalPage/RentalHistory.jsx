import { useState } from "react";
import SettlementPanel from "../../Request/ViewRequest/components/SettlementPanel";
import "./RentalHistory.css";

function displayDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
}

export default function RentalHistory({ rentals, onRefresh }) {
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const selectedRental = rentals.find(
    (rental) => rental.rentalId === selectedRentalId,
  );

  return (
    <section className="view-rental-card rental-history-card">
      <header className="rental-history-heading">
        <div>
          <h2>Rental History</h2>
          <p>Previous tenants and final settlement records for this unit.</p>
        </div>
        <span>{rentals.length} previous rental{rentals.length === 1 ? "" : "s"}</span>
      </header>

      {rentals.length === 0 ? (
        <p className="rental-history-empty">No previous rentals recorded.</p>
      ) : (
        <div className="rental-history-layout">
          <div className="rental-history-list" aria-label="Previous rentals">
            {rentals.map((rental) => (
              <button
                type="button"
                key={rental.rentalId}
                className={`rental-history-list-item${selectedRentalId === rental.rentalId ? " is-selected" : ""}`}
                aria-pressed={selectedRentalId === rental.rentalId}
                onClick={() => setSelectedRentalId(rental.rentalId)}
              >
                <strong>{rental.tenant.fullName}</strong>
                <span>
                  {displayDate(rental.moveInDate)} – {displayDate(rental.moveOutDate)}
                </span>
              </button>
            ))}
          </div>

          {selectedRental && (
            <div className="rental-history-detail">
              <h3>Previous tenant details</h3>
              <dl className="rental-history-fields">
                <div>
                  <dt>Full name</dt>
                  <dd>{selectedRental.tenant.fullName}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedRental.tenant.email}</dd>
                </div>
                <div>
                  <dt>Contact number</dt>
                  <dd>{selectedRental.tenant.contact || "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Move-in date</dt>
                  <dd>{displayDate(selectedRental.moveInDate)}</dd>
                </div>
                <div>
                  <dt>Move-out date</dt>
                  <dd>{displayDate(selectedRental.moveOutDate)}</dd>
                </div>
              </dl>

              {selectedRental.settlement ? (
                <SettlementPanel
                  settlement={selectedRental.settlement}
                  rentalId={selectedRental.rentalId}
                  onRefresh={onRefresh}
                />
              ) : (
                <p className="rental-history-no-settlement">
                  No final settlement was recorded for this rental.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
