import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays } from "@fortawesome/free-solid-svg-icons";

import "./DashboardWelcome.css";

export default function DashboardWelcome() {
  return (
    <section className="tenant-welcome">
      <div>
        <span className="tenant-eyebrow">YOUR HOME, AT A GLANCE</span>
        <h1>Hello, Maria!</h1>
        <p>Here&apos;s what&apos;s happening with your apartment today.</p>
      </div>
      <div className="tenant-today">
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>
          <strong>October 25, 2026</strong>
          <small>Sunday</small>
        </span>
      </div>
    </section>
  );
}
