import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import "./SearchRequests.css";

export default function SearchRequests({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-requests-container">
      <FontAwesomeIcon
        className="search-requests-icon"
        icon={faMagnifyingGlass}
      />

      <input
        name="search-requests"
        type="text"
        className="search-requests-input"
        placeholder="Search Tenant's Requests"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
    </div>
  );
}
