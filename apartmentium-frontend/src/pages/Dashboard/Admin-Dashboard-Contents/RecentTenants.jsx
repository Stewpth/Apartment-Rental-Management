import "./RecentTenants.css";

const tenants = [
  { initials: "MS", name: "Maria Santos", unit: "2B", status: "Active", moveInDate: "Jan 15, 2025" },
  { initials: "JD", name: "Juan Dela Cruz", unit: "1C", status: "Active", moveInDate: "Feb 03, 2025" },
  { initials: "AL", name: "Ana Lopez", unit: "3A", status: "Active", moveInDate: "Mar 12, 2025" },
  { initials: "RB", name: "Ramon Bautista", unit: "4B", status: "Pending", moveInDate: "Oct 01, 2025" },
  { initials: "CP", name: "Celeste Reyes", unit: "2A", status: "Active", moveInDate: "Apr 20, 2025" },
];

export default function RecentTenants() {
  return (
    <section className="recent-tenants-card" aria-labelledby="recent-tenants-title">
      <header className="recent-tenants-header">
        <h2 id="recent-tenants-title">Recent Tenants</h2>
        <button className="recent-tenants-view-all" type="button">
          View all
        </button>
      </header>

      <div className="recent-tenants-table-wrapper">
        <table className="recent-tenants-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Unit</th>
              <th scope="col">Status</th>
              <th scope="col">Move-in Date</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.name}>
                <td>
                  <span className="recent-tenant-name">
                    <span className="recent-tenant-avatar" aria-hidden="true">
                      {tenant.initials}
                    </span>
                    {tenant.name}
                  </span>
                </td>
                <td>{tenant.unit}</td>
                <td>
                  <span
                    className={`recent-tenant-status ${tenant.status.toLowerCase()}`}
                  >
                    {tenant.status}
                  </span>
                </td>
                <td>{tenant.moveInDate}</td>
                <td>
                  <button
                    className="recent-tenant-actions"
                    type="button"
                    aria-label={`Actions for ${tenant.name}`}
                  >
                    &hellip;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
