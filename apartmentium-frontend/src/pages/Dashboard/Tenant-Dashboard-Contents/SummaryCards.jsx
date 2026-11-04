import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faHouse,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

import "./SummaryCards.css";
import { NavLink } from "react-router-dom";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(`${value}T00:00:00Z`))
    : "No due date";

export default function SummaryCards({ dashboard = {} }) {
  const stats = [
    {
      label: "My unit",
      value: dashboard.rental?.unitNumber || "—",
      detail:
        dashboard.rental?.status === "ON_LEAVING"
          ? "Moving out"
          : dashboard.rental
            ? "Active rental"
            : "No active rental",
      icon: faHouse,
      tone: "blue",
      path: "/tenant/rentals",
    },
    {
      label: "Total Due",
      value: `₱${Number(dashboard.totalDue || 0).toLocaleString("en-PH")}`,
      detail: dashboard.nextDueDate
        ? `Next due ${formatDate(dashboard.nextDueDate)}`
        : "No outstanding dues",
      icon: faCreditCard,
      tone: "amber",
      path: "/tenant/payments",
    },
    {
      label: "My requests",
      value: dashboard.requestCount ?? 0,
      detail: "View request updates",
      icon: faClipboardList,
      tone: "violet",
      path: "/tenant/requests",
    },
  ];
  return (
    <section className="tenant-stats" aria-label="Rental summary">
      {stats.map((stat) => (
        <NavLink
          className="tenant-stat tenant-stat-link"
          to={stat.path}
          key={stat.label}
        >
          <span className={`tenant-stat-icon ${stat.tone}`}>
            <FontAwesomeIcon icon={stat.icon} />
          </span>
          <span className="tenant-stat-label">{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.detail}</small>
        </NavLink>
      ))}
    </section>
  );
}
