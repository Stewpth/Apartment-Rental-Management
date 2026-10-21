import "./PaymentHistory.css";

export default function PaymentHistory({ payments }) {
  return (
    <section className="payment-detail-section">
      <h2>Payment History</h2>
      <div className="payment-detail-table-wrap">
        <table className="payment-detail-table payment-history-table">
          <thead>
            <tr><th>Date Recorded</th><th className="payment-detail-amount">Amount</th><th>Note</th></tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={`${payment.date}-${payment.amount}`}>
                <td>{payment.date}</td>
                <td className="payment-detail-amount">{payment.amount}</td>
                <td>{payment.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
