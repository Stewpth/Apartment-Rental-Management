import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchRecords() {
  return (
    <>
      <div className="search-records-container">
        <FontAwesomeIcon
          className="search-records-icon"
          icon={faMagnifyingGlass}
        />
        <input
          name="Search record"
          type="text"
          className="search-record-input"
          placeholder="Search tenant and Units"
        />
      </div>
      <div className="search-records-filter-box">
        <button className="search-records-filter-btn selected">
          All Rentals
        </button>
        <button className="search-records-filter-btn">Occupied</button>
        <button className="search-records-filter-btn">Available</button>
      </div>
    </>
  );
}
