import { useState } from "react";
import RentalRecordsHeader from "./RentalRecords/RentalRecordsHeader";
import SearchRecords from "./RentalRecords/SearchRecords";
import RecordList from "./RentalRecords/RecordList";
import AddUnitModal from "./RentalRecords/AddUnitModal";
import AssignTenantModal from "./RentalRecords/AssignTenantModal";

import { initialRentalRecords } from "./RentalRecords/rentalRecords";
import "./RentalRecords.css";

export default function RentalsRecords({ newUnits, setNewUnits, unitUpdates, setUnitUpdates, initialUnitId }) {
  const [selectedFilter, setSelectedFilter] = useState("All Rentals");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(Boolean(initialUnitId));
  const existingUnits = [...initialRentalRecords, ...newUnits].map((unit) => ({
    ...unit,
    ...(unitUpdates[unit.unit_id] || {}),
  }));

  function addUnit(unit) {
    setNewUnits((currentUnits) => [...currentUnits, unit]);
    setIsAddUnitOpen(false);
  }

  function assignTenant({ unit, tenant }) {
    setUnitUpdates((current) => ({
      ...current,
      [unit.unit_id]: {
        tenant_id: `tenant-${Date.now()}`,
        tenant_name: tenant.fullName,
        tenant_email: tenant.email,
        tenant_contact: tenant.contactNumber,
        tenant_profile_picture: tenant.profilePicture,
        isAvailable: false,
      },
    }));
    setIsAssignTenantOpen(false);
  }

  return (
    <>
      <section className="rentals-records-container">
        <RentalRecordsHeader
          onAddUnit={() => setIsAddUnitOpen(true)}
          onAssignTenant={() => setIsAssignTenantOpen(true)}
        />
        <SearchRecords
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <RecordList
          units={existingUnits}
          selectedFilter={selectedFilter}
          searchTerm={searchTerm}
        />
        <div className="rental-records-footer">Check the records</div>
      </section>
      {isAddUnitOpen && (
        <AddUnitModal
          existingUnits={existingUnits}
          onCancel={() => setIsAddUnitOpen(false)}
          onSave={addUnit}
        />
      )}
      {isAssignTenantOpen && (
        <AssignTenantModal
          availableUnits={existingUnits.filter((unit) => unit.isAvailable)}
          initialUnitId={initialUnitId}
          onCancel={() => setIsAssignTenantOpen(false)}
          onCreate={assignTenant}
        />
      )}
    </>
  );
}

