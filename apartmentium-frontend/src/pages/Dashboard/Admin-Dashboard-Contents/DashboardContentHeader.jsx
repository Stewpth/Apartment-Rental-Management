import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

import "./DashboardContentHeader.css";

export default function DashboardContentHeader() {
  return (
    <section className="dashboard-content-header">
      <div className="content-header-left">
        <span className="greet-text">GOOD MORNING</span>
        <h2 className="greet-with-username">Welcome back, Admin!</h2>
        <span className="header-summary-details">
          Here's what happening with your apartments today.
        </span>
      </div>
      <div className="content-header-right">
        <FontAwesomeIcon icon={faCalendar} className="calendar-icon" />
        <div className="calendar-info">
          <span className="date">Oct 12, 2026</span>
          <span className="weekdays">Monday</span>
        </div>
      </div>
    </section>
  );
}
