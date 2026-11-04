import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../../hooks/useAuth";

import "./DashboardContentHeader.css";

export default function DashboardContentHeader() {
  const { user } = useAuth();
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const date = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
    today,
  );
  const weekday = new Intl.DateTimeFormat("en-PH", { weekday: "long" }).format(
    today,
  );
  return (
    <section className="dashboard-content-header">
      <div className="content-header-left">
        <span className="greet-text">{greeting.toUpperCase()}</span>
        <h2 className="greet-with-username">
          Welcome back, {user?.username || "Admin"}!
        </h2>
        <span className="header-summary-details">
          Here's what happening with your apartments today.
        </span>
      </div>
      <div className="content-header-right">
        <FontAwesomeIcon icon={faCalendar} className="calendar-icon" />
        <div className="calendar-info">
          <span className="date">{date}</span>
          <span className="weekdays">{weekday}</span>
        </div>
      </div>
    </section>
  );
}
