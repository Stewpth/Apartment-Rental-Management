import { useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RentalsHeader from "./admin-rental-contents/RentalsHeader";
import RentalsSummary from "./admin-rental-contents/RentalsSummary";
import RentalsRecords from "./admin-rental-contents/RentalRecords";
import { initialRentalRecords } from "./admin-rental-contents/RentalRecords/rentalRecords";
import "./Rentals.css";

export default function Rentals() {
  const location = useLocation();
  const returnedUnit = location.state?.unit;
  const [newUnits, setNewUnits] = useState(() => returnedUnit && !initialRentalRecords.some((unit) => unit.unit_id === returnedUnit.unit_id) ? [returnedUnit] : []);
  const [unitUpdates, setUnitUpdates] = useState(() => {
    if (!returnedUnit) return {};
    const original = initialRentalRecords.find((unit) => unit.unit_id === returnedUnit.unit_id);
    return original?.isAvailable && !returnedUnit.isAvailable ? { [returnedUnit.unit_id]: returnedUnit } : {};
  });
  const assignedCount = Object.keys(unitUpdates).length + newUnits.filter((unit) => !unit.isAvailable && !unitUpdates[unit.unit_id]).length;

  return (
    <>
      <title>Rentals</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="rentals-container">
              <div className="rentals-contents">
                <RentalsHeader />
                <RentalsSummary additionalUnits={newUnits.length} assignedTenants={assignedCount} />
                <RentalsRecords newUnits={newUnits} setNewUnits={setNewUnits} unitUpdates={unitUpdates} setUnitUpdates={setUnitUpdates} initialUnitId={location.state?.assignUnitId} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
