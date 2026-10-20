import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function RentalRecordsHeader() {
  return (
    <div className="rental-records-header">
      <h4 className="rental-records-title">Rental Records</h4>
      <div className="rental-records-actions">
        <button className="rental-action-button" type="button">
          <FontAwesomeIcon
            className="rental-records-icons"
            icon={faPlusCircle}
          />
          <span className="rental-records-action-name">Assign tenant</span>
        </button>
        <button className="rental-action-button" type="button">
          <FontAwesomeIcon
            className="rental-records-icons"
            icon={faPlusCircle}
          />
          <span className="rental-records-action-name">Add Unit</span>
        </button>
      </div>
    </div>
  );
}
