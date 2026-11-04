import "./UpcomingEvents.css";
import { NavLink } from "react-router-dom";

const formatDateParts = (date) => {
  const value = new Date(`${date}T00:00:00Z`);
  return {
    month: new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" })
      .format(value)
      .toUpperCase(),
    day: new Intl.DateTimeFormat("en", {
      day: "2-digit",
      timeZone: "UTC",
    }).format(value),
  };
};

export default function UpcomingEvents({ events = [] }) {
  return (
    <section
      className="upcoming-events-card"
      aria-labelledby="upcoming-events-title"
    >
      <header className="upcoming-events-header">
        <h2 id="upcoming-events-title">Upcoming Events</h2>
        <NavLink className="upcoming-events-view-all" to="/admin/payments">
          View all
        </NavLink>
      </header>

      <ul className="upcoming-events-list">
        {events.map((event) => {
          const { month, day } = formatDateParts(event.dueDate);
          return (
            <li className="upcoming-event" key={event.id}>
              <time className="upcoming-event-date" dateTime={event.dueDate}>
                <span>{month}</span>
                <strong>{day}</strong>
              </time>
              <div className="upcoming-event-details">
                <NavLink to={event.path}>
                  <strong>{event.title}</strong>
                </NavLink>
                <span>
                  {event.detail} · ₱
                  {Number(event.amount).toLocaleString("en-PH")}
                </span>
                <span className="upcoming-event-note">
                  Due{" "}
                  {new Intl.DateTimeFormat("en-PH", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  }).format(new Date(`${event.dueDate}T00:00:00Z`))}
                </span>
              </div>
            </li>
          );
        })}
        {events.length === 0 && (
          <li className="upcoming-events-empty">No upcoming rent dues.</li>
        )}
      </ul>
    </section>
  );
}
