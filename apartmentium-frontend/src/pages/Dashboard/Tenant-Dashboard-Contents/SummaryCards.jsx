import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faHouse,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

import "./SummaryCards.css";

const stats = [
  {
    label: "My unit",
    value: "101",
    detail: "Active rental",
    icon: faHouse,
    tone: "blue",
  },
  {
    label: "Total Due",
    value: "₱4,500",
    detail: "Due Nov 5, 2026",
    icon: faCreditCard,
    tone: "amber",
  },
  {
    label: "My requests",
    value: "2",
    detail: "1 ongoing · 1 resolved",
    icon: faClipboardList,
    tone: "violet",
  },
];

export default function SummaryCards() {
  return (
    <section className="tenant-stats" aria-label="Rental summary">
      {stats.map((stat) => (
        <article className="tenant-stat" key={stat.label}>
          <span className={`tenant-stat-icon ${stat.tone}`}>
            <FontAwesomeIcon icon={stat.icon} />
          </span>
          <span className="tenant-stat-label">{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.detail}</small>
        </article>
      ))}
    </section>
  );
}
