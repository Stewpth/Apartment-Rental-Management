import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faArrowUp,
  faArrowDown,
  faBuilding,
  faFile,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

import "./SummaryCard.css";

export default function SummaryCard() {
  return (
    <section className="summary-card-container">
      <div className="summary-total-card">
        <div className="summary-total-icon-box tenant">
          <FontAwesomeIcon icon={faUserGroup} className="summary-total-icon" />
        </div>
        <h4 className="summary-total-title">Total Tenants</h4>
        <h2 className="summary-total-count">48</h2>
        <p className="summary-result-text">
          <FontAwesomeIcon
            icon={faArrowUp}
            className="result-arrow-icon positive"
          />
          <span className="result-percent-label positive">6%</span> from last
          month
        </p>
      </div>

      <div className="summary-total-card">
        <div className="summary-total-icon-box units">
          <FontAwesomeIcon icon={faBuilding} className="summary-total-icon" />
        </div>
        <h4 className="summary-total-title">Total Units</h4>
        <h2 className="summary-total-count">24</h2>
        <p className="summary-result-text">
          <FontAwesomeIcon
            icon={faArrowUp}
            className="result-arrow-icon positive"
          />
          <span className="result-percent-label positive">0%</span> from last
          month
        </p>
      </div>

      <div className="summary-total-card">
        <div className="summary-total-icon-box occupied-units">
          <FontAwesomeIcon icon={faFile} className="summary-total-icon" />
        </div>
        <h4 className="summary-total-title">Occupied Units</h4>
        <h2 className="summary-total-count">20</h2>
        <p className="summary-result-text">
          <span className="result-percent-label neutral">83%</span> from last
          month
        </p>
      </div>

      <div className="summary-total-card">
        <div className="summary-total-icon-box payments">
          <FontAwesomeIcon icon={faCreditCard} className="summary-total-icon" />
        </div>
        <h4 className="summary-total-title">Payments</h4>
        <h2 className="summary-total-count">3</h2>
        <p className="summary-result-text">
          <FontAwesomeIcon
            icon={faArrowDown}
            className="result-arrow-icon negative"
          />
          <span className="result-percent-label negative">50%</span> from last
          month
        </p>
      </div>
    </section>
  );
}
