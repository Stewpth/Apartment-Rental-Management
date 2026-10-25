import { useNavigate } from "react-router-dom";

function UnitStatus({ isAvailable }) {
  return (
    <div className={`rentals-unit-status ${isAvailable ? "available" : "occupied"}`}>
      {isAvailable ? "Available" : "Occupied"}
    </div>
  );
}

export default function RecordList({ units, selectedFilter, searchTerm }) {
  const navigate = useNavigate();
  const search = searchTerm.trim().toLowerCase();
  const filteredRecords = units.filter((unit) => {
    const matchesSearch = (unit.tenant_name || "").toLowerCase().includes(search) || unit.unit.toLowerCase().includes(search);
    const matchesFilter = selectedFilter === "All Rentals" || (selectedFilter === "Available" && unit.isAvailable) || (selectedFilter === "Occupied" && !unit.isAvailable);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="rentals-record-list">
      {filteredRecords.length ? filteredRecords.map((unit) => (
        <button className="rentals-record-unit" key={unit.unit_id} type="button" onClick={() => navigate(`/admin/rentals/${unit.unit_id}`, { state: { unit } })} aria-label={`View details for ${unit.unit}`}>
          <span className="rentals-unit-details"><span className="unit-tenant-name">{unit.tenant_name || "No tenant assigned"}</span><span className="unit-tenant-room-details">{unit.unit} · ?{unit.unit_cost.toLocaleString("en-PH")}/month</span></span>
          <UnitStatus isAvailable={unit.isAvailable} />
        </button>
      )) : <p className="rentals-record-empty">No rental records found.</p>}
    </div>
  );
}
