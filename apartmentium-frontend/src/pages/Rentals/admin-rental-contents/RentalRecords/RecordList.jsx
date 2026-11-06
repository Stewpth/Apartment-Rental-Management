import { useNavigate } from "react-router-dom";
import EmptyState from "../../../../components/ui/EmptyState";

function UnitStatus({ unit }) {
  const status = unit.isMaintenance
    ? "maintenance"
    : unit.isAvailable
      ? "available"
      : "occupied";
  return (
    <div className={`rentals-unit-status ${status}`}>
      {status === "maintenance" ? "Maintenance" : status === "available" ? "Available" : "Occupied"}
    </div>
  );
}

export default function RecordList({ units, selectedFilter, searchTerm }) {
  const navigate = useNavigate();
  const search = searchTerm.trim().toLowerCase();
  const filteredRecords = units.filter((unit) => {
    const matchesSearch =
      (unit.tenant_name || "").toLowerCase().includes(search) ||
      unit.unit.toLowerCase().includes(search);
    const matchesFilter =
      selectedFilter === "All Rentals" ||
      (selectedFilter === "Available" && unit.isAvailable) ||
      (selectedFilter === "Occupied" && Boolean(unit.tenant_id)) ||
      (selectedFilter === "Maintenance" && unit.isMaintenance);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="rentals-record-list">
      {filteredRecords.length ? (
        filteredRecords.map((unit) => (
          <button
            className="rentals-record-unit"
            key={unit.unit_id}
            type="button"
            onClick={() =>
              navigate(`/admin/rentals/${unit.unit_id}`, { state: { unit } })
            }
            aria-label={`View details for ${unit.unit}`}
          >
            <span className="rentals-unit-details">
              <span className="unit-tenant-name">
                {unit.tenant_name || "No tenant assigned"}
              </span>
              <span className="unit-tenant-room-details">
                {unit.unit} &middot; &#8369;
                {unit.unit_cost.toLocaleString("en-PH")}
                /month
              </span>
            </span>
            <UnitStatus unit={unit} />
          </button>
        ))
      ) : (
        <EmptyState
          title={units.length ? "No matching rentals" : "No rental records yet"}
          description={units.length
            ? "Try changing your search or selecting a different filter."
            : "Units and tenant assignments will appear here once they are added."}
        />
      )}
    </div>
  );
}
