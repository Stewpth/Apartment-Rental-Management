// This is just a sample records, i will convert it to database soon.
const rentalsRecordList = [
  {
    unit_id: "unit-101",
    tenant_id: "tnt1",
    tenant_name: "Juan Dela Cruz",
    unit: "Unit 101",
    unit_cost: 5000,
    isAvailable: false,
  },
  {
    unit_id: "unit-102",
    tenant_id: null,
    tenant_name: null,
    unit: "Unit 102",
    unit_cost: 6000,
    isAvailable: true,
  },
  {
    unit_id: "unit-103",
    tenant_id: null,
    tenant_name: null,
    unit: "Unit 103",
    unit_cost: 4500,
    isAvailable: true,
  },
  {
    unit_id: "unit-104",
    tenant_id: null,
    tenant_name: null,
    unit: "Unit 104",
    unit_cost: 4500,
    isAvailable: true,
  },
  {
    unit_id: "unit-105",
    tenant_id: "tnt2",
    tenant_name: "Maria Santos",
    unit: "Unit 105",
    unit_cost: 4500,
    isAvailable: false,
  },
  {
    unit_id: "unit-106",
    tenant_id: "tnt3",
    tenant_name: "Amorosa Maximino",
    unit: "Unit 106",
    unit_cost: 5000,
    isAvailable: false,
  },
];

function UnitStatus({ isAvailable }) {
  return (
    <div
      className={`rentals-unit-status ${
        isAvailable ? "available" : "occupied"
      }`}
    >
      {isAvailable ? "Available" : "Occupied"}
    </div>
  );
}

export default function RecordList({ selectedFilter, searchTerm }) {
  const filteredRecords = rentalsRecordList.filter((unit) => {
    // 1. Search by tenant name or unit number.
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      (unit.tenant_name || "").toLowerCase().includes(search) ||
      unit.unit.toLowerCase().includes(search);

    // 2. Filter by availability.
    const matchesFilter =
      selectedFilter === "All Rentals" ||
      (selectedFilter === "Available" && unit.isAvailable) ||
      (selectedFilter === "Occupied" && !unit.isAvailable);

    // Both conditions must be true.
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
