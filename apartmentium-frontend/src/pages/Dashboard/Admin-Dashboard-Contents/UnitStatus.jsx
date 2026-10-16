import "./UnitStatus.css";

const unitStatuses = [
  { label: "Occupied", count: 20, percentage: "83%", color: "occupied" },
  { label: "Vacant", count: 3, percentage: "12%", color: "vacant" },
  {
    label: "Maintenance",
    count: 1,
    percentage: "4%",
    color: "maintenance",
  },
];

export default function UnitStatus() {
  return (
    <section className="unit-status-card" aria-labelledby="unit-status-title">
      <h2 id="unit-status-title">Unit Status</h2>

      <div
        className="unit-status-chart"
        role="img"
        aria-label="24 total units: 20 occupied, 3 vacant, and 1 under maintenance"
      >
        <div className="unit-status-chart-center">
          <strong>24</strong>
          <span>Total Units</span>
        </div>
      </div>

      <ul className="unit-status-legend">
        {unitStatuses.map((status) => (
          <li key={status.label}>
            <span className={`unit-status-dot ${status.color}`} aria-hidden="true" />
            <span className="unit-status-label">{status.label}</span>
            <span className="unit-status-count">{status.count}</span>
            <span className="unit-status-percentage">{status.percentage}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
