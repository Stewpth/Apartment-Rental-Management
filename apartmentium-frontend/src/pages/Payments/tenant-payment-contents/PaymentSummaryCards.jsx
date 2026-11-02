import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faCalendarDays, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { formatPaymentAmount, formatPaymentDate } from "../../../utils/paymentUtils";

export default function PaymentSummaryCards({ summary }) {
  const summaryItems = [
    { label: "Total Due", value: formatPaymentAmount(summary.totalDue), detail: "Outstanding balance", icon: faCreditCard, tone: "blue" },
    { label: "Next Due Date", value: formatPaymentDate(summary.nextDueDate), detail: summary.nextDueDate ? "Oldest unpaid monthly due" : "No unpaid dues", icon: faCalendarDays, tone: "green" },
    { label: "Last Payment", value: summary.lastPayment ? formatPaymentAmount(summary.lastPayment.amount) : "—", detail: summary.lastPayment ? `Recorded ${formatPaymentDate(summary.lastPayment.date)}` : "No payments recorded", icon: faReceipt, tone: "purple" },
  ];
  return (
    <section className="tenant-payment-summary" aria-label="Payment summary">
      {summaryItems.map((item) => (
        <article className="tenant-payment-summary-card" key={item.label}>
          <span className={`tenant-payment-summary-icon ${item.tone}`}>
            <FontAwesomeIcon icon={item.icon} />
          </span>
          <span className="tenant-payment-summary-label">{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.detail}</small>
        </article>
      ))}
    </section>
  );
}
