import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faCalendarDays, faReceipt } from "@fortawesome/free-solid-svg-icons";

const summaryItems = [
  { label: "Total Due", value: "₱4,500", detail: "For October 2026", icon: faCreditCard, tone: "blue" },
  { label: "Next Due Date", value: "Nov 5, 2026", detail: "Monthly rent", icon: faCalendarDays, tone: "green" },
  { label: "Last Payment", value: "₱4,500", detail: "Recorded on Sep 5, 2026", icon: faReceipt, tone: "purple" },
];

export default function PaymentSummaryCards() {
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
