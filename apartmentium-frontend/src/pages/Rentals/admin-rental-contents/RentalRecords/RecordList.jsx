function UnitStatus({ isAvailable }) {
  return (
    <div
      className={`rentals-unit-status ${isAvailable ? "available" : "occupied"}`}
    >
      {isAvailable ? "Available" : "Occupied"}
    </div>
  );
}

export default function RecordList({ units, selectedFilter, searchTerm }) {
  const search = searchTerm.trim().toLowerCase();
  const filteredRecords = units.filter((unit) => {
    const matchesSearch =
      (unit.tenant_name || "").toLowerCase().includes(search) ||
      unit.unit.toLowerCase().includes(search);
    const matchesFilter =
      selectedFilter === "All Rentals" ||
      (selectedFilter === "Available" && unit.isAvailable) ||
      (selectedFilter === "Occupied" && !unit.isAvailable);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="rentals-record-list">
      {filteredRecords.length > 0 ? (
        filteredRecords.map((unit) => (
          <div className="rentals-record-unit" key={unit.unit_id}>
            <div className="rentals-unit-details">
              <span className="unit-tenant-name">
                {unit.tenant_name || "No tenant assigned"}
              </span>
              <span className="unit-tenant-room-details">
                {unit.unit} · ₱{unit.unit_cost.toLocaleString("en-PH")}/month
              </span>
            </div>
            <UnitStatus isAvailable={unit.isAvailable} />
          </div>
        ))
      ) : (
        <p className="rentals-record-empty">No rental records found.</p>
      )}
    </div>
  );
}
