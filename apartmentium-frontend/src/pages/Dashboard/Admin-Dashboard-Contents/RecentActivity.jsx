import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faDoorOpen,
  faMoneyBillWave,
  faScrewdriverWrench,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

import "./RecentActivity.css";

const activities = [
  {
    title: "New tenant registered",
    detail: "Maria Santos",
    time: "2 hours ago",
    icon: faUserPlus,
    color: "tenant",
  },
  {
    title: "Payment received",
    detail: "Unit 2B - ₱8,500",
    time: "4 hours ago",
    icon: faMoneyBillWave,
    color: "payment",
  },
  {
    title: "Maintenance request",
    detail: "Unit 3A - Leaking faucet",
    time: "5 hours ago",
    icon: faScrewdriverWrench,
    color: "maintenance",
  },
  {
    title: "New announcement",
    detail: "Monthly building maintenance...",
    time: "7 hours ago",
    icon: faBullhorn,
    color: "announcement",
  },
  {
    title: "Tenant moved out",
    detail: "Unit 1C - Juan Dela Cruz",
    time: "1 day ago",
    icon: faDoorOpen,
    color: "move-out",
  },
];

export default function RecentActivity() {
  return (
    <section className="recent-activity-card" aria-labelledby="recent-activity-title">
      <header className="recent-activity-header">
        <h2 id="recent-activity-title">Recent Activity</h2>
        <button className="recent-activity-view-all" type="button">
          View all
        </button>
      </header>

      <ul className="recent-activity-list">
        {activities.map((activity) => (
          <li className="recent-activity-item" key={activity.title}>
            <span
              className={`recent-activity-icon ${activity.color}`}
              aria-hidden="true"
            >
              <FontAwesomeIcon icon={activity.icon} />
            </span>
            <div className="recent-activity-details">
              <strong>{activity.title}</strong>
              <span>{activity.detail}</span>
            </div>
            <time className="recent-activity-time">{activity.time}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
