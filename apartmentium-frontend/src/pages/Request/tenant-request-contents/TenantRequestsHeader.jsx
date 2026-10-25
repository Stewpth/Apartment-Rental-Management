import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "./TenantRequestsHeader.css";

export default function TenantRequestsHeader({ onNewRequest }) {
  return (
    <header className="tenant-requests-header">
      <div>
        <h1>Your Requests</h1>
        <p>View the status of your submitted requests.</p>
      </div>
      <button type="button" onClick={onNewRequest}>
        <FontAwesomeIcon icon={faPlus} /> New Request
      </button>
    </header>
  );
}
