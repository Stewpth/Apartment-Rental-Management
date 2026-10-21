import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function PaymentsHeader({ searchTerm, setSearchTerm }) {
  return (
    <div className="payments-header">
      <div className="payments-header-details">
        <h2 className="payments-title">Payments</h2>
        <span className="payments-description">Records the payments here</span>
      </div>
      <div className="payments-search-container">
        <FontAwesomeIcon
          className="payments-search-icon"
          icon={faMagnifyingGlass}
        />

        <input
          name="payments-search"
          type="text"
          className="payments-search-input"
          placeholder="Search tenant"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>
    </div>
  );
}
