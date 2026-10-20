import { useState } from "react";

import RentalRecordsHeader from "./RentalRecords/RentalRecordsHeader";
import SearchRecords from "./RentalRecords/SearchRecords";
import RecordList from "./RentalRecords/RecordList";

import "./RentalRecords.css";

export default function RentalsRecords() {
  const [selectedFilter, setSelectedFilter] = useState("All Rentals");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="rentals-records-container">
      <RentalRecordsHeader />

      <SearchRecords
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <RecordList selectedFilter={selectedFilter} searchTerm={searchTerm} />

      <div className="rental-records-footer">Check the records</div>
    </section>
  );
}
