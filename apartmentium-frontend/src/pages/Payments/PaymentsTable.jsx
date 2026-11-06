import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import EmptyState from "../../components/ui/EmptyState";
import {
  formatPaymentAmount,
  formatPaymentDate,
} from "../../utils/paymentUtils";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

export default function PaymentsTable({ searchTerm = "", payments = [] }) {
  const [sort, setSort] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const rows = useMemo(() => {
    const filtered = payments.filter((payment) =>
      payment.tenant.fullName
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase()),
    );
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const left = sort.key === "tenantName" ? a.tenant.fullName : a[sort.key];
      const right = sort.key === "tenantName" ? b.tenant.fullName : b[sort.key];
      const comparison =
        sort.key === "totalDue"
          ? Number(left) - Number(right)
          : sort.key === "dueDate"
            ? new Date(left || 0) - new Date(right || 0)
            : left.localeCompare(right, "en", { numeric: true });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [searchTerm, sort, payments]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  }

  function sortIcon(key) {
    const icon =
      sort.key === key && sort.direction === "desc"
        ? faChevronDown
        : faChevronUp;
    return <FontAwesomeIcon className="payments-sort-icon" icon={icon} />;
  }

  return (
    <section className="payments-table-card" aria-label="Payment records">
      <div className="payments-table-scroll">
        <table className="payments-table">
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => toggleSort("tenantName")}>
                  Tenant {sortIcon("tenantName")}
                </button>
              </th>
              <th>
                <button type="button" onClick={() => toggleSort("dueDate")}>
                  Due Date {sortIcon("dueDate")}
                </button>
              </th>
              <th className="payments-amount-heading">
                Monthly Rent
              </th>
              <th className="payments-amount-heading">
                <button type="button" onClick={() => toggleSort("totalDue")}>
                  Total Due {sortIcon("totalDue")}
                </button>
              </th>
              <th aria-label="Open payment" />
            </tr>
          </thead>
          <tbody>
            {visibleRows.length ? (
              visibleRows.map((payment) => (
                <tr key={payment.rentalId}>
                  <td>
                    {payment.tenant.fullName}
                    <small className="payments-unit-label">
                      {payment.unit.unitNumber}
                    </small>
                  </td>
                  <td>
                    {Number(payment.totalDue) === 0
                      ? <span className="payments-fully-paid">Fully paid</span>
                      : formatPaymentDate(payment.dueDate)}
                  </td>
                  <td className="payments-amount">
                    {formatPaymentAmount(payment.monthlyRent)}
                  </td>
                  <td className="payments-amount">
                    {formatPaymentAmount(payment.totalDue)}
                  </td>
                  <td className="payments-row-action-box">
                    <Link
                      className="payments-row-action"
                      type="button"
                      aria-label={`Open ${payment.tenant.fullName} payment`}
                      to={`/admin/payments/${payment.rentalId}`}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="payments-empty" colSpan="5">
                  <EmptyState
                    title={
                      searchTerm ? "No matching tenants" : "No payment records"
                    }
                    description={
                      searchTerm
                        ? "Try a different search term."
                        : "Active rental balances will appear here when monthly dues are available."
                    }
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="payments-table-footer">
        <span>
          Showing {rows.length ? (page - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(page * pageSize, rows.length)} of {rows.length} tenants
        </span>
        <nav className="payments-pagination" aria-label="Payments pages">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            type="button"
            className="payments-current-page"
            aria-current="page"
          >
            {page}
          </button>
          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </nav>
      </footer>
    </section>
  );
}
