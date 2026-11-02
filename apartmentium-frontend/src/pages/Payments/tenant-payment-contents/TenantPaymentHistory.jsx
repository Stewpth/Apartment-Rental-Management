import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { formatPaymentAmount, formatPaymentDate, formatBillingPeriod } from "../../../utils/paymentUtils";

const pageSize = 5;

export default function TenantPaymentHistory({ payments }) {
  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState("all");
  const filteredPayments = payments.filter(
    (payment) => yearFilter === "all" || payment.date.startsWith(yearFilter),
  );
  const pageCount = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const visiblePayments = filteredPayments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const firstPayment = filteredPayments.length ? (page - 1) * pageSize + 1 : 0;
  const lastPayment = Math.min(page * pageSize, filteredPayments.length);

  return (
    <section className="tenant-payment-history" id="tenant-payment-history">
      <header className="tenant-payment-history-header">
        <h2>Payment History</h2>
        <label className="tenant-payment-filter">
          <span className="visually-hidden">Filter payment history</span>
          <select
            aria-label="Filter payment history"
            value={yearFilter}
            onChange={(event) => {
              setYearFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Payments</option>
            {[...new Set(payments.map((payment) => payment.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a)).map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
      </header>
      <div className="tenant-payment-table-scroll">
        <table className="tenant-payment-table">
          <thead>
            <tr>
              <th>Date Recorded</th>
              <th>Month Covered</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visiblePayments.length ? visiblePayments.map((payment) => (
              <tr key={payment.id}>
                <td>{formatPaymentDate(payment.date)}</td>
                <td>{payment.billingPeriods.length ? payment.billingPeriods.map(formatBillingPeriod).join(", ") : "—"}</td>
                <td className="tenant-payment-amount">{formatPaymentAmount(payment.amount)}</td>
                <td>{payment.reference || "—"}</td>
                <td><span className="tenant-payment-paid">Paid</span></td>
              </tr>
            )) : <tr><td colSpan="5" className="tenant-payment-empty">No payments have been recorded.</td></tr>}
          </tbody>
        </table>
      </div>
      <footer className="tenant-payment-history-footer">
        <span>
          Showing {firstPayment} to {lastPayment} of {filteredPayments.length} payments
        </span>
        <nav className="tenant-payment-pagination" aria-label="Payment history pages">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={page === pageNumber ? "current" : ""}
              aria-current={page === pageNumber ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={page === pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </nav>
      </footer>
    </section>
  );
}
