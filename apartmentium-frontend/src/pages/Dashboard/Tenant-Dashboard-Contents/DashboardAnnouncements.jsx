import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faCalendarDays,
  faDroplet,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import TenantPanel from "./TenantPanel";

import "./DashboardAnnouncements.css";

const announcements = [
  {
    icon: faDroplet,
    tone: "blue",
    title: "Scheduled water interruption",
    date: "October 22, 2026",
    text: "Water supply maintenance will take place on October 25, from 8:00 AM to 12:00 PM.",
  },
  {
    icon: faCalendarDays,
    tone: "amber",
    title: "Monthly building inspection",
    date: "October 20, 2026",
    text: "Please keep your unit accessible during the scheduled inspection.",
  },
  {
    icon: faBullhorn,
    tone: "violet",
    title: "Reminder: Rental payment",
    date: "October 18, 2026",
    text: "Please review your outstanding balance and upcoming due date.",
  },
];

export function LatestAnnouncements() {
  return (
    <TenantPanel
      title="Latest announcements"
      icon={faBullhorn}
      className="announcement-panel"
    >
      <div className="tenant-announcements">
        {announcements.map((item) => (
          <article className="tenant-announcement" key={item.title}>
            <span className={`tenant-announcement-icon ${item.tone}`}>
              <FontAwesomeIcon icon={item.icon} />
            </span>
            <div>
              <strong>{item.title}</strong>
              <time>{item.date}</time>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </TenantPanel>
  );
}

export function TenantHelpCard() {
  return (
    <section className="tenant-help">
      <span className="tenant-help-icon">
        <FontAwesomeIcon icon={faHouse} />
      </span>
      <div>
        <strong>Need help?</strong>
        <p>
          If you have any concerns, please contact your landlord or property
          manager.
        </p>
      </div>
    </section>
  );
}
