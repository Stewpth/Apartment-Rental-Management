import { useState } from "react";
import RentalRecordsHeader from "./RentalRecords/RentalRecordsHeader";
import SearchRecords from "./RentalRecords/SearchRecords";
import RecordList from "./RentalRecords/RecordList";
import AddUnitModal from "./RentalRecords/AddUnitModal";

import { initialRentalRecords } from "./RentalRecords/rentalRecords";
import "./RentalRecords.css";

export default function RentalsRecords({ newUnits, setNewUnits }) {
  const [selectedFilter, setSelectedFilter] = useState("All Rentals");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const existingUnits = [...initialRentalRecords, ...newUnits];

  function addUnit(unit) {
    setNewUnits((currentUnits) => [...currentUnits, unit]);
    setIsAddUnitOpen(false);
  }

  return (
    <>
      <section className="rentals-records-container">
        <RentalRecordsHeader onAddUnit={() => setIsAddUnitOpen(true)} />
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
    </>
  );
}
