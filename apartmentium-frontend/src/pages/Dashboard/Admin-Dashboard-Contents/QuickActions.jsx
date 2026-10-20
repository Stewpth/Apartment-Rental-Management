import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBuilding,
  faCreditCard,
  faClipboard,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";

import "./QuickActions.css";

const actions = [
  { label: "Add Tenant", icon: faUserPlus, path: "/admin/rentals" },
  { label: "Add Unit", icon: faBuilding, path: "/admin/rentals" },
  { label: "Record Payment", icon: faCreditCard, path: "/admin/payments" },
  { label: "Check Request", icon: faClipboard, path: "/admin/requests" },
];

export default function QuickActions() {
  return (
    <section
      className="quick-actions-card"
      aria-labelledby="quick-actions-title"
    >
      <h2 id="quick-actions-title">Quick Actions</h2>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <NavLink className="quick-action" key={action.label} to={action.path}>
            <span className="quick-action-icon">
              <FontAwesomeIcon icon={action.icon} />
            </span>
            <span className="quick-action-label">{action.label}</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="quick-action-arrow"
              aria-hidden="true"
            />
          </NavLink>
        ))}
      </div>
    </section>
  );
}
