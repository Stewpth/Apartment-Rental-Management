import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleExclamation,
  faCircleInfo,
  faClock,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

export default function TenantPaymentSidebar() {
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
        <strong className="tenant-payment-balance-amount">₱4,500</strong>
        <span className="tenant-payment-balance-note">Total amount due</span>
      </section>
      <section className="tenant-payment-due-card">
        <h2>This Month&apos;s Due</h2>
        <div className="tenant-payment-monthly-rent">
          <span>Monthly Rent</span>
          <strong>₱4,500</strong>
        </div>
        <div className="tenant-payment-due-row">
          <span>
            <FontAwesomeIcon icon={faCalendarDays} />
            Due Date
          </span>
          <strong>Nov 5, 2026</strong>
        </div>
        <div className="tenant-payment-due-row">
          <span>
            <FontAwesomeIcon
              className="overdue-icon"
              icon={faCircleExclamation}
            />
            Status
          </span>
          <span className="tenant-payment-pending">Pending</span>
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
