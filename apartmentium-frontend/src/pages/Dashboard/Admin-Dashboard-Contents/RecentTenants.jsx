import "./RecentTenants.css";
import { NavLink } from "react-router-dom";

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(`${date}T00:00:00Z`))
    : "—";

export default function RecentTenants({ tenants = [] }) {
  return (
    <section
      className="recent-tenants-card"
      aria-labelledby="recent-tenants-title"
    >
      <header className="recent-tenants-header">
        <h2 id="recent-tenants-title">Recent Tenants</h2>
        <NavLink className="recent-tenants-view-all" to="/admin/rentals">
          View all
        </NavLink>
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
            {tenants.length === 0 && (
              <tr>
                <td colSpan="5">No active rentals yet.</td>
              </tr>
            )}
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>
                  <NavLink
                    className="recent-tenant-name"
                    to={`/admin/rentals/${tenant.unitId}`}
                  >
                    <span className="recent-tenant-avatar" aria-hidden="true">
                      {tenant.name
                        .split(/\s+/)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    {tenant.name}
                  </NavLink>
                </td>
                <td>{tenant.unit}</td>
                <td>
                  <span
                    className={`recent-tenant-status ${tenant.status === "ACTIVE" ? "active" : "pending"}`}
                  >
                    {tenant.status === "ON_LEAVING" ? "Leaving" : "Active"}
                  </span>
                </td>
                <td>{formatDate(tenant.moveInDate)}</td>
                <td>
                  <NavLink
                    className="recent-tenant-actions"
                    to={`/admin/rentals/${tenant.unitId}`}
                    aria-label={`View ${tenant.name}'s rental`}
                  >
                    ›
                  </NavLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
