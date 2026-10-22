import "./PaymentBreakdown.css";

export default function PaymentBreakdown({ items }) {
  return (
    <section className="payment-detail-section">
      <h2>Monthly Due Breakdown</h2>
      <div className="payment-detail-table-wrap">
        <table className="payment-detail-table">
          <thead>
            <tr>
              <th>Rental Period</th>
              <th>Due Date</th>
              <th className="payment-detail-amount">Unpaid Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.period}>
                <td>{item.period}</td>
                <td>{item.dueDate}</td>
                <td className="payment-detail-amount">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
