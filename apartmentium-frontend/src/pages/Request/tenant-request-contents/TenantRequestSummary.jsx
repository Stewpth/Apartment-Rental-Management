import "./TenantRequestSummary.css";

const statuses = [
  { key: "not_resolved", label: "Not Resolved" },
  { key: "ongoing", label: "Ongoing" },
  { key: "resolved", label: "Resolved" },
];

export default function TenantRequestSummary({ requests }) {
  return (
    <section className="tenant-request-summary" aria-label="Request status summary">
      {statuses.map((status) => (
        <article className="tenant-request-summary-card" key={status.key}>
          <span>{status.label}</span>
          <strong>{requests.filter((request) => request.status === status.key).length}</strong>
        </article>
      ))}
    </section>
  );
}
