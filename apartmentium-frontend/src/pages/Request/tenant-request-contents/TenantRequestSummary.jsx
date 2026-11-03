import "./TenantRequestSummary.css";

const statuses = [
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "REJECTED", label: "Rejected" },
];

export default function TenantRequestSummary({ requests }) {
  return (
    <section
      className="tenant-request-summary"
      aria-label="Request status summary"
    >
      {statuses.map((status) => (
        <article className="tenant-request-summary-card" key={status.key}>
          <span>{status.label}</span>
          <strong>
            {requests.filter((request) => request.status === status.key).length}
          </strong>
        </article>
      ))}
    </section>
  );
}
