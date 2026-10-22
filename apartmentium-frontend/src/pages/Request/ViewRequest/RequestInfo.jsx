import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCardClip,
  faUser,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

export default function RequestInfo() {
  return (
    <div className="request-info-container">
      <h4 className="request-info-title">Request Information</h4>
      <div className="request-info-grid">
        <div className="request-info-card">
          <FontAwesomeIcon className="request-info-icon" icon={faIdCardClip} />
          <div className="request-info-details">
            <span className="request-info-details-title">Request ID</span>
            <span className="request-info-label">REQ-0001</span>
          </div>
        </div>

        <div className="request-info-card">
          <FontAwesomeIcon className="request-info-icon" icon={faUser} />
          <div className="request-info-details">
            <span className="request-info-details-title">Tenant</span>
            <span className="request-info-label">
              Maria Santos &#8226; Unit 101
            </span>
          </div>
        </div>

        <div className="request-info-card">
          <FontAwesomeIcon className="request-info-icon" icon={faCalendar} />
          <div className="request-info-details">
            <span className="request-info-details-title">Date Created</span>
            <span className="request-info-label">March 21, 2026</span>
          </div>
        </div>

        <div className="request-info-card status-category">
          <div className="request-info-details">
            <span className="request-info-details-title">Status</span>
            <span className="request-info-status not_resolved">
              Not Resolved
            </span>
          </div>
          <div className="request-info-details">
            <span className="request-info-details-title">Category</span>
            <span className="request-info-category repair">Repair</span>
          </div>
        </div>
      </div>
    </div>
  );
}
