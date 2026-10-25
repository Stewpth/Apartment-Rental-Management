import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const payments = [
  ["Sep 5, 2026", "September 2026", "PAY-202609-001"],
  ["Aug 5, 2026", "August 2026", "PAY-202608-001"],
  ["Jul 5, 2026", "July 2026", "PAY-202607-001"],
  ["Jun 5, 2026", "June 2026", "PAY-202606-001"],
  ["May 5, 2026", "May 2026", "PAY-202605-001"],
  ["Apr 5, 2026", "April 2026", "PAY-202604-001"],
  ["Mar 5, 2026", "March 2026", "PAY-202603-001"],
  ["Feb 5, 2026", "February 2026", "PAY-202602-001"],
  ["Jan 5, 2026", "January 2026", "PAY-202601-001"],
  ["Dec 5, 2025", "December 2025", "PAY-202512-001"],
  ["Nov 5, 2025", "November 2025", "PAY-202511-001"],
  ["Oct 5, 2025", "October 2025", "PAY-202510-001"],
].map(([date, month, reference]) => ({ date, month, reference, amount: "₱4,500" }));

const pageSize = 5;

export default function TenantPaymentHistory() {
  const [page, setPage] = useState(1);
  const [yearFilter, setYearFilter] = useState("all");
  const filteredPayments = payments.filter(
    (payment) => yearFilter === "all" || payment.month.endsWith(yearFilter),
  );
  const pageCount = Math.ceil(filteredPayments.length / pageSize);
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
            <option value="2026">2026</option>
            <option value="2025">2025</option>
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
            {visiblePayments.map((payment) => (
              <tr key={payment.reference}>
                <td>{payment.date}</td>
                <td>{payment.month}</td>
                <td className="tenant-payment-amount">{payment.amount}</td>
                <td>{payment.reference}</td>
                <td><span className="tenant-payment-paid">Paid</span></td>
              </tr>
            ))}
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
