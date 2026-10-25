import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { formatMoney, sampleRentalDetails } from "./rentalViewUtils";

export default function PaymentSummary({ unit }) {
  return (
    <section className="view-rental-card">
      <h2 className="view-rental-section-title">
        <FontAwesomeIcon icon={faWallet} /> Payment Summary
      </h2>
      <div className="view-rental-balance">
        <span>Total Outstanding Balance</span>
        <strong>
          {formatMoney(unit.outstanding_balance ?? sampleRentalDetails.balance)}
        </strong>
      </div>
      <div className="view-rental-last-payment">
        <span>Last Recorded Payment</span>
        <strong>{unit.last_payment || sampleRentalDetails.lastPayment}</strong>
      </div>
      <p className="view-rental-sample-note">
        Sample information for UI illustration only.
      </p>
    </section>
  );
}
