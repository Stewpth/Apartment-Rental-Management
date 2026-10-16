import "./UpcomingEvents.css";

const upcomingEvents = [
  {
    month: "OCT",
    day: "15",
    title: "Payment Due",
    detail: "Unit 3A · ₱8,500",
    note: "Due in 3 days",
    icon: "◷",
  },
  {
    month: "OCT",
    day: "18",
    title: "Unit Inspection",
    detail: "Unit 4B",
    note: "10:00 AM - 12:00 PM",
    icon: "◷",
  },
  {
    month: "OCT",
    day: "25",
    title: "Building Maintenance",
    detail: "Common Areas",
    note: "All day",
    icon: "◷",
  },
  {
    month: "NOV",
    day: "01",
    title: "Lease Renewal",
    detail: "Unit 2B - Maria Santos",
    note: "Due in 19 days",
    icon: "◷",
  },
];

export default function UpcomingEvents() {
  return (
    <section
      className="upcoming-events-card"
      aria-labelledby="upcoming-events-title"
    >
      <header className="upcoming-events-header">
        <h2 id="upcoming-events-title">Upcoming Events</h2>
        <button className="upcoming-events-view-all" type="button">
          View all
        </button>
      </header>

      <ul className="upcoming-events-list">
        {upcomingEvents.map((event) => (
          <li className="upcoming-event" key={`${event.month}-${event.day}`}>
            <time className="upcoming-event-date">
              <span>{event.month}</span>
              <strong>{event.day}</strong>
            </time>
            <div className="upcoming-event-details">
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
              <span className="upcoming-event-note">
                <span aria-hidden="true">{event.icon}</span>
                {event.note}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
