import "./PaymentSummary.css";

export default function PaymentSummary({ totalDue, monthlyRent }) {
  return (
    <section className="payment-summary" aria-label="Payment summary">
      <article className="payment-summary-card">
        <span>Total Due</span>
        <strong>{totalDue}</strong>
      </article>
      <article className="payment-summary-card">
        <span>Monthly Rent</span>
        <strong>{monthlyRent}</strong>
      </article>
    </section>
  );
}
