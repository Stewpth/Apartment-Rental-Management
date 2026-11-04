import "./UnitStatus.css";
import { NavLink } from "react-router-dom";

export default function UnitStatus({ statuses = {} }) {
  const total =
    (statuses.OCCUPIED || 0) +
    (statuses.AVAILABLE || 0) +
    (statuses.MAINTENANCE || 0);
  const occupied = statuses.OCCUPIED || 0;
  const available = statuses.AVAILABLE || 0;
  const maintenance = statuses.MAINTENANCE || 0;
  const occupiedEnd = total ? (occupied / total) * 100 : 0;
  const availableEnd = total ? occupiedEnd + (available / total) * 100 : 0;
  const unitStatuses = [
    { label: "Occupied", count: occupied, color: "occupied" },
    { label: "Vacant", count: available, color: "vacant" },
    { label: "Maintenance", count: maintenance, color: "maintenance" },
  ].map((status) => ({
    ...status,
    percentage: `${total ? Math.round((status.count / total) * 100) : 0}%`,
  }));
  const chartStyle = {
    background: total
      ? `conic-gradient(#3478e5 0% ${occupiedEnd}%, #d5dfed ${occupiedEnd}% ${availableEnd}%, #ffbd43 ${availableEnd}% 100%)`
      : "#d5dfed",
  };
  return (
    <section className="unit-status-card" aria-labelledby="unit-status-title">
      <h2 id="unit-status-title">Unit Status</h2>

      <div
        className="unit-status-chart"
        role="img"
        aria-label={`${total} total units: ${occupied} occupied, ${available} vacant, and ${maintenance} under maintenance`}
        style={chartStyle}
      >
        <div className="unit-status-chart-center">
          <strong>{total}</strong>
          <span>Total Units</span>
        </div>
      </div>

      <ul className="unit-status-legend">
        {unitStatuses.map((status) => (
          <li key={status.label}>
            <span
              className={`unit-status-dot ${status.color}`}
              aria-hidden="true"
            />
            <NavLink
              className="unit-status-label unit-status-link"
              to="/admin/rentals"
            >
              {status.label}
            </NavLink>
            <span className="unit-status-count">{status.count}</span>
            <span className="unit-status-percentage">{status.percentage}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
