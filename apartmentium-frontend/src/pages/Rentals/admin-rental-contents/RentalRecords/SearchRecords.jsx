import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchRecords({
  selectedFilter,
  setSelectedFilter,
  searchTerm,
  setSearchTerm,
}) {
  const filters = ["All Rentals", "Occupied", "Available"];

  return (
    <>
      <div className="search-records-container">
        <FontAwesomeIcon
          className="search-records-icon"
          icon={faMagnifyingGlass}
        />

        <input
          name="search-records"
          type="text"
          className="search-record-input"
          placeholder="Search tenant and units"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="search-records-filter-box">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={`search-records-filter-btn ${
              selectedFilter === filter ? "selected" : ""
            }`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </>
  );
}
