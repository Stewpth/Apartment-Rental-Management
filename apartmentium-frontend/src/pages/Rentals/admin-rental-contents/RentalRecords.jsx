import { useState } from "react";
import api from "../../../api/axios";
import RentalRecordsHeader from "./RentalRecords/RentalRecordsHeader";
import SearchRecords from "./RentalRecords/SearchRecords";
import RecordList from "./RentalRecords/RecordList";
import AddUnitModal from "./RentalRecords/AddUnitModal";
import AssignTenantModal from "./RentalRecords/AssignTenantModal";

import "./RentalRecords.css";

export default function RentalsRecords({ units, onRefresh, initialUnitId }) {
  const [selectedFilter, setSelectedFilter] = useState("All Rentals");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(
    Boolean(initialUnitId),
  );
  async function addUnit(unit) {
    try {
      await api.post("/admin/units", {
        unitNumber: unit.unit.replace(/^Unit\s*/i, ""),
        unitPrice: unit.unit_cost,
      });
      await onRefresh();
      setIsAddUnitOpen(false);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to create unit.",
        { cause: error },
      );
    }
  }

  async function assignTenant({ unit, tenant }) {
    try {
      await api.post("/admin/rentals/assign-tenant", {
        fullName: tenant.fullName,
        email: tenant.email,
        username: tenant.username,
        phone: tenant.contactNumber,
        password: tenant.password,
        confirmPassword: tenant.confirmPassword,
        unitId: unit.unit_id,
        moveInDate: tenant.moveInDate,
      });
      await onRefresh();
      // Keep the loading screen visible long enough to be noticed on fast responses.
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setIsAssignTenantOpen(false);
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to assign tenant.",
        { cause: error },
      );
    }
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
          units={units}
          selectedFilter={selectedFilter}
          searchTerm={searchTerm}
        />
        <div className="rental-records-footer">Select a unit to view its rental details.</div>
      </section>
      {isAddUnitOpen && (
        <AddUnitModal
          existingUnits={units}
          onCancel={() => setIsAddUnitOpen(false)}
          onSave={addUnit}
        />
      )}
      {isAssignTenantOpen && (
        <AssignTenantModal
          availableUnits={units.filter((unit) => unit.isAvailable)}
          initialUnitId={initialUnitId}
          onCancel={() => setIsAssignTenantOpen(false)}
          onCreate={assignTenant}
        />
      )}
    </>
  );
}
