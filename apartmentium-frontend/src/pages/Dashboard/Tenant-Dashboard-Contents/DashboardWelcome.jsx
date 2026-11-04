import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import "./DashboardWelcome.css";

export default function DashboardWelcome({ tenantName = "Tenant" }) {
  const today = new Date();
  const date = new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(
    today,
  );
  const weekday = new Intl.DateTimeFormat("en-PH", { weekday: "long" }).format(
    today,
  );
  return (
    <section className="tenant-welcome">
      <div>
        <span className="tenant-eyebrow">YOUR HOME, AT A GLANCE</span>
        <h1>Hello, {tenantName.split(/\s+/)[0]}!</h1>
        <p>Here&apos;s what&apos;s happening with your apartment today.</p>
      </div>
      <div className="tenant-today">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>
          <strong>{date}</strong>
          <small>{weekday}</small>
        </span>
      </div>
    </section>
  );
}
