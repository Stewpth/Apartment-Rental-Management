import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "./PaymentDetailsHeader.css";

export default function PaymentDetailsHeader({ tenantName, unit, onRecordPayment }) {
  return (
    <header className="payment-details-header">
      <Link className="payment-back-link" to="/admin/payments">
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Payments</span>
      </Link>
      <div className="payment-details-heading-row">
        <div>
          <h1>{tenantName}</h1>
          <p>Unit {unit}</p>
        </div>
        <button className="record-payment-button" type="button" onClick={onRecordPayment}>Record Payment</button>
      </div>
    </header>
  );
}
