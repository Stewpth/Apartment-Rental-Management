import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleExclamation,
  faCircleInfo,
  faClock,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { formatPaymentAmount, formatPaymentDate } from "../../../utils/paymentUtils";

export default function TenantPaymentSidebar({ summary, rental }) {
  return (
    <aside className="tenant-payment-sidebar">
      <section className="tenant-payment-balance-card">
        <div className="tenant-payment-balance-art" aria-hidden="true">
          <span>
            <FontAwesomeIcon icon={faCreditCard} />
          </span>
          <i className="bill-line one" />
          <i className="bill-line two" />
          <b>₱</b>
          <em>
            <FontAwesomeIcon icon={faClock} />
          </em>
        </div>
        <span className="tenant-payment-balance-label">Current Balance</span>
        <strong className="tenant-payment-balance-amount">{formatPaymentAmount(summary.totalDue)}</strong>
        <span className="tenant-payment-balance-note">Total amount due</span>
      </section>
      <section className="tenant-payment-due-card">
        <h2>This Month&apos;s Due</h2>
        <div className="tenant-payment-monthly-rent">
          <span>Monthly Rent</span>
          <strong>{formatPaymentAmount(rental.monthlyRent)}</strong>
        </div>
        <div className="tenant-payment-monthly-rent">
          <span>Due This Month</span>
          <strong>{formatPaymentAmount(summary.currentMonthDue)}</strong>
        </div>
        <div className="tenant-payment-due-row">
          <span>
            <FontAwesomeIcon icon={faCalendarDays} />
            Due Date
          </span>
          <strong>{formatPaymentDate(summary.currentMonthDueDate)}</strong>
        </div>
        <div className="tenant-payment-due-row">
          <span>
            <FontAwesomeIcon
              className="overdue-icon"
              icon={faCircleExclamation}
            />
            Status
          </span>
          <span className={summary.currentMonthStatus === "PAID" ? "tenant-payment-paid" : "tenant-payment-pending"}>{summary.currentMonthStatus === "PAID" ? "Paid" : summary.currentMonthStatus === "PARTIAL" ? "Partially paid" : "Unpaid"}</span>
        </div>
      </section>
      <section className="tenant-payment-help-card">
        <FontAwesomeIcon icon={faCircleInfo} />
        <div>
          <strong>Need Help?</strong>
          <p>
            If you have any concerns regarding your payment, please contact your
            landlord or property manager.
          </p>
        </div>
      </section>
    </aside>
  );
}
