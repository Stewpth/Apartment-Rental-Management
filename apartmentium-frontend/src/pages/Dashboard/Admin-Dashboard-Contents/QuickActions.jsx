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
  { label: "Add Tenant", icon: faUserPlus },
  { label: "Add Unit", icon: faBuilding },
  { label: "Record Payment", icon: faCreditCard },
  { label: "Create Request", icon: faClipboard },
];

export default function QuickActions() {
  return (
    <section className="quick-actions-card" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title">Quick Actions</h2>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <button className="quick-action" key={action.label} type="button">
            <span className="quick-action-icon">
              <FontAwesomeIcon icon={action.icon} />
            </span>
            <span className="quick-action-label">{action.label}</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="quick-action-arrow"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
