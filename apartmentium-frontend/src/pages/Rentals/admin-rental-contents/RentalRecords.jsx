import RentalRecordsHeader from "./RentalRecords/RentalRecordsHeader";
import SearchRecords from "./RentalRecords/SearchRecords";
import RecordList from "./RentalRecords/RecordList";

import "./RentalRecords.css";

export default function RentalsRecords() {
  return (
    <section className="rentals-records-container">
      <RentalRecordsHeader />
      <SearchRecords />
      <RecordList />

      <div className="rental-records-footer">Check the records</div>
    </section>
  );
}
