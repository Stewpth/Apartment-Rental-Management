import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const payments = [
  { tenant: "Juan Dela Cruz", dueDate: "October 5, 2026", totalDue: 5000 },
  { tenant: "Maria Santos", dueDate: "October 10, 2026", totalDue: 9000 },
  { tenant: "Pedro Reyes", dueDate: "October 15, 2026", totalDue: 11000 },
  { tenant: "Ana Lopez", dueDate: "October 5, 2026", totalDue: 4500 },
  { tenant: "Mark Villanueva", dueDate: "October 10, 2026", totalDue: 6000 },
  { tenant: "Riza Cruz", dueDate: "October 20, 2026", totalDue: 5500 },
  { tenant: "John Lim", dueDate: "October 25, 2026", totalDue: 8000 },
  { tenant: "Erika Tan", dueDate: "October 30, 2026", totalDue: 4500 },
];

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export default function PaymentsTable({ searchTerm = "" }) {
  const [sort, setSort] = useState({ key: "", direction: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const rows = useMemo(() => {
    const filtered = payments.filter((payment) =>
      payment.tenant.toLowerCase().includes(searchTerm.trim().toLowerCase()),
    );
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      const comparison =
        sort.key === "totalDue"
          ? left - right
          : left.localeCompare(right, "en", { numeric: true });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [searchTerm, sort]);

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
                <button type="button" onClick={() => toggleSort("tenant")}>
                  Tenant {sortIcon("tenant")}
                </button>
              </th>
              <th>
                <button type="button" onClick={() => toggleSort("dueDate")}>
                  Monthly Due Date {sortIcon("dueDate")}
                </button>
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
                <tr key={payment.tenant}>
                  <td>{payment.tenant}</td>
                  <td>{payment.dueDate}</td>
                  <td className="payments-amount">
                    {currency.format(payment.totalDue)}
                  </td>
                  <td className="payments-row-action-box">
                    <button
                      className="payments-row-action"
                      type="button"
                      aria-label={`Open ${payment.tenant} payment`}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="payments-empty" colSpan="4">
                  No payments found.
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
