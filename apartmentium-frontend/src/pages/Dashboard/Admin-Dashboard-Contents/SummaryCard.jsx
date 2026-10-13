import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup, faArrowUp } from "@fortawesome/free-solid-svg-icons";

export default function SummaryCard() {
  return (
    <section className="summary-card-container">
      <div className="summary-total-card">
        <div className="summary-total-icon-box">
          <FontAwesomeIcon icon={faUserGroup} className="summary-total-icon" />
        </div>
        <h4 className="summary-total-title">Total Tenants</h4>
        <h2 className="summary-total-count">48</h2>
        <div className="comparison-container">
          <FontAwesomeIcon icon={faArrowUp} />
          <p className="total-tenants-text">
            <span className="comparison-track-text">6%</span> from last month
          </p>
        </div>
      </div>
      <div className="summary-total-card"></div>
      <div className="summary-total-card"></div>
      <div className="summary-total-card"></div>
    </section>
  );
}
