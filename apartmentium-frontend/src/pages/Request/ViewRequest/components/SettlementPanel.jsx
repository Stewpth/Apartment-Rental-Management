import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../../api/axios";

export default function SettlementPanel({ settlement, rentalId, onRefresh }) {
  const [refundAmount, setRefundAmount] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function submitRefund(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/admin/settlements/${settlement.id}/refunds`, {
        amount: Number(refundAmount),
        note,
      });
      setRefundAmount("");
      setNote("");
      await onRefresh();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to record refund.",
      );
    }
  }

  async function submitAdjustment(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/admin/settlements/${settlement.id}/adjustments`, {
        amount: Number(adjustmentAmount),
        reason,
      });
      setAdjustmentAmount("");
      setReason("");
      await onRefresh();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to record adjustment.",
      );
    }
  }

  const refunded = settlement.refunds.reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  );
  const adjustedBalance =
    Number(settlement.originalBalance) +
    settlement.adjustments.reduce(
      (sum, adjustment) => sum + Number(adjustment.amount),
      0,
    );
  const adjustedRefundDue = Math.max(0, -adjustedBalance);
  const amountOwedCents = Math.max(0, Math.round(adjustedBalance * 100));
  const remainingRefundCents = Math.max(
    0,
    Math.round(adjustedRefundDue * 100) - Math.round(refunded * 100),
  );
  const fullyPaid = amountOwedCents === 0;

  return (
    <section className="rental-history-settlement">
      <h2>Final Settlement Snapshot</h2>
      <div
        className={`settlement-payment-status${fullyPaid ? " is-paid" : " has-balance"}`}
        role="status"
      >
        <span className="settlement-payment-badge">
          {fullyPaid ? "Fully paid" : "Balance due"}
        </span>
        <p>
          {fullyPaid
            ? remainingRefundCents > 0
              ? `The tenant has no balance to pay. Refund pending: ₱${(remainingRefundCents / 100).toFixed(2)}.`
              : "The tenant has no remaining balance to pay."
            : `Remaining balance to pay: ₱${(amountOwedCents / 100).toFixed(2)}.`}
        </p>
      </div>
      <p>Unpaid monthly dues: ₱{settlement.unpaidDues}</p>
      <p>Unused rent credit: ₱{settlement.unusedRentCredit}</p>
      <p>
        Existing tenant credit: ₱{settlement.existingTenantCredit} (remaining
        refund component ₱{settlement.tenantCreditRefund})
      </p>
      <p>Approved charges: ₱{settlement.approvedCharges}</p>
      <p>Credits applied: ₱{settlement.creditsApplied}</p>
      <p>Original signed balance: ₱{settlement.originalBalance}</p>
      <p>
        Adjusted balance after audited corrections: ₱
        {adjustedBalance.toFixed(2)}
      </p>
      <p>
        Amount owed: ₱{Math.max(0, adjustedBalance).toFixed(2)} · Refund due: ₱
        {adjustedRefundDue.toFixed(2)}
      </p>
      <p>
        Refund recorded: ₱{refunded.toFixed(2)} · Remaining: ₱
        {Math.max(0, adjustedRefundDue - refunded).toFixed(2)}
      </p>
      {amountOwedCents > 0 && Number(settlement.unpaidDues) > 0 && (
        <Link className="request-btn accept" to={`/admin/payments/${rentalId}`}>
          Review or record remaining rent payments
        </Link>
      )}
      <h3>Unpaid due snapshot</h3>
      {settlement.dueSnapshots.map((due) => (
        <p key={due.billingPeriod}>
          {due.billingPeriod}: balance ₱{due.balance} (due {due.dueDate})
        </p>
      ))}
      {settlement.refunds.map((refund) => (
        <p key={refund.id}>
          Refund ₱{refund.amount} recorded{" "}
          {new Date(refund.processedAt).toLocaleString()}
          {refund.note ? ` · ${refund.note}` : ""}
        </p>
      ))}
      {settlement.adjustments.map((adjustment) => (
        <p key={adjustment.id}>
          Adjustment ₱{adjustment.amount}: {adjustment.reason}
        </p>
      ))}
      {error && <p role="alert">{error}</p>}
      {adjustedRefundDue > refunded && (
        <form onSubmit={submitRefund}>
          <h3>Record processed refund</h3>
          <label>
            Amount
            <input
              required
              type="number"
              min="0.01"
              max={(adjustedRefundDue - refunded).toFixed(2)}
              step="0.01"
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
            />
          </label>
          <label>
            Note
            <input
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <button type="submit" className="request-btn accept">
            Record Refund
          </button>
        </form>
      )}
      <form onSubmit={submitAdjustment}>
        <h3>Audited settlement adjustment</h3>
        <label>
          Amount (+charge / −credit)
          <input
            required
            type="number"
            step="0.01"
            value={adjustmentAmount}
            onChange={(event) => setAdjustmentAmount(event.target.value)}
          />
        </label>
        <label>
          Reason
          <input
            required
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        <button type="submit" className="request-btn accept">
          Record Adjustment
        </button>
      </form>
    </section>
  );
}
