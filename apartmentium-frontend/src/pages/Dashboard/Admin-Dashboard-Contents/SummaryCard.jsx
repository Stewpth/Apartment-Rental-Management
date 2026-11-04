import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faBuilding,
  faFile,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

import "./SummaryCard.css";
import { NavLink } from "react-router-dom";

export default function SummaryCard({ summary = {} }) {
  const cards = [
    {
      title: "Total Tenants",
      value: summary.tenants ?? 0,
      detail: "Registered tenants",
      icon: faUserGroup,
      tone: "tenant",
      path: "/admin/rentals",
    },
    {
      title: "Total Units",
      value: summary.units ?? 0,
      detail: "All units",
      icon: faBuilding,
      tone: "units",
      path: "/admin/rentals",
    },
    {
      title: "Occupied Units",
      value: summary.occupied ?? 0,
      detail: "Currently occupied",
      icon: faFile,
      tone: "occupied-units",
      path: "/admin/rentals",
    },
    {
      title: "Payments",
      value: summary.paymentsThisMonth ?? 0,
      detail: "Recorded this month",
      icon: faCreditCard,
      tone: "payments",
      path: "/admin/payments",
    },
  ];
  return (
    <section className="summary-card-container">
      {cards.map((card) => (
        <NavLink
          className="summary-total-card summary-total-link"
          to={card.path}
          key={card.title}
        >
          <div className={`summary-total-icon-box ${card.tone}`}>
            <FontAwesomeIcon icon={card.icon} className="summary-total-icon" />
          </div>
          <h4 className="summary-total-title">{card.title}</h4>
          <h2 className="summary-total-count">{card.value}</h2>
          <p className="summary-result-text">{card.detail}</p>
        </NavLink>
      ))}
    </section>
  );
}
