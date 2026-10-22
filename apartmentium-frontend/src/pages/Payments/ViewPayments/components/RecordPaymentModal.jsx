import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import "./RecordPaymentModal.css";

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export default function RecordPaymentModal({
  tenantName,
  unit,
  totalDue,
  onClose,
  onSubmit,
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const numericAmount = Number(amount) || 0;
  const remaining = Math.max(totalDue - numericAmount, 0);

  function handleSubmit(event) {
    event.preventDefault();
    if (numericAmount <= 0 || numericAmount > totalDue) return;
    onSubmit({ amount: numericAmount, note: note.trim() });
  }

  return (
    <div
      className="record-payment-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
    >
      <section
        className="record-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-payment-title"
      >
        <header className="record-payment-modal-header">
          <h2 id="record-payment-title">Record Payment</h2>
          <button
            type="button"
            className="record-payment-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>
        <div className="record-payment-tenant">
          <div>
            <strong>{tenantName}</strong>
            <span>Unit {unit}</span>
          </div>
          <div className="record-payment-due">
            <span>Current Total Due</span>
            <strong>{currency.format(totalDue)}</strong>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="record-payment-field">
            <span>Payment Amount (₱)</span>
            <input
              autoFocus
              type="number"
              min="0.01"
              max={totalDue}
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </label>
          <label className="record-payment-field">
            <span>Note (Optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add a note if necessary..."
              rows="3"
            />
          </label>
          <div className="record-payment-calculation">
            <div>
              <span>Current Total Due</span>
              <strong>{currency.format(totalDue)}</strong>
            </div>
            <div>
              <span>Payment Amount</span>
              <strong className="record-payment-credit">
                − {currency.format(numericAmount)}
              </strong>
            </div>
            <div className="record-payment-remaining">
              <span>Remaining Balance</span>
              <strong>{currency.format(remaining)}</strong>
            </div>
          </div>
          {numericAmount > totalDue && (
            <p className="record-payment-error" role="alert">
              Payment cannot exceed the current total due.
            </p>
          )}
          <footer className="record-payment-actions">
            <button
              type="button"
              className="record-payment-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="record-payment-submit"
              disabled={numericAmount <= 0 || numericAmount > totalDue}
            >
              Record Payment
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

// TODO-BACKEND: The text on the notes must be 50 length below, use backend to do that.
