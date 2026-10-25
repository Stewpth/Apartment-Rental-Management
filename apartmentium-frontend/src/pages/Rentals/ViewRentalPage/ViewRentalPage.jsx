import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCircleInfo,
  faHouse,
  faUser,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import { initialRentalRecords } from "../admin-rental-contents/RentalRecords/rentalRecords";
import "../Rentals.css";
import "./ViewRentalPage.css";

const sampleDetails = {
  moveInDate: "October 1, 2026",
  leaseEndDate: "September 30, 2027",
  balance: 10000,
  lastPayment: "Oct 5, 2026",
};

function formatMoney(value) {
  return `\u20B1${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ViewRentalPage() {
  const { unitId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const unit =
    location.state?.unit ||
    initialRentalRecords.find((record) => record.unit_id === unitId);

  function backToRentals(assignTenant = false) {
    navigate("/admin/rentals", {
      state: {
        unit,
        ...(assignTenant && unit ? { assignUnitId: unit.unit_id } : {}),
      },
    });
  }

  const tenantName = unit?.tenant_name || "No Tenant Assigned";
  const fallbackEmail = `${tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")}@example.com`;

  return (
    <>
      <title>View Rental</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="rentals-container">
              <div className="rentals-contents view-rental-contents">
                {!unit ? (
                  <section className="view-rental-card">
                    <h1>Rental record not found</h1>
                    <button
                      type="button"
                      className="view-rental-secondary-button"
                      onClick={() => navigate("/admin/rentals")}
                    >
                      Back to Rentals
                    </button>
                  </section>
                ) : unit.isAvailable ? (
                  <section className="view-rental-card view-rental-unit-card">
                    <header className="view-rental-heading">
                      <button
                        type="button"
                        className="view-rental-back-icon"
                        onClick={() => backToRentals()}
                        aria-label="Back to rentals"
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
                      <div>
                        <h1>View Unit Details</h1>
                        <p>Rentals / Unit Details</p>
                      </div>
                      <span className="view-rental-status available">
                        Available
                      </span>
                    </header>
                    <div className="view-rental-unit-intro">
                      <FontAwesomeIcon icon={faHouse} />
                      <div>
                        <h2>{unit.unit}</h2>
                        <p>Apartment Unit</p>
                      </div>
                    </div>
                    <div className="view-rental-unit-info">
                      <div>
                        <span>Monthly Rent</span>
                        <strong>{formatMoney(unit.unit_cost)}</strong>
                      </div>
                      <div>
                        <span>Rental Status</span>
                        <strong className="view-rental-available-text">
                          Available
                        </strong>
                      </div>
                    </div>
                    <div className="view-rental-vacant-note">
                      <strong>
                        <FontAwesomeIcon icon={faCircleInfo} /> No Tenant
                        Assigned
                      </strong>
                      <p>
                        This unit is currently vacant. Assign a tenant to start
                        a new rental.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="view-rental-primary-button"
                      onClick={() => backToRentals(true)}
                    >
                      <FontAwesomeIcon icon={faUser} /> Assign Tenant
                    </button>
                    <button
                      type="button"
                      className="view-rental-secondary-button"
                      onClick={() => backToRentals()}
                    >
                      Back to Rentals
                    </button>
                  </section>
                ) : (
                  <>
                    <section className="view-rental-card">
                      <header className="view-rental-heading">
                        <button
                          type="button"
                          className="view-rental-back-icon"
                          onClick={() => backToRentals()}
                          aria-label="Back to rentals"
                        >
                          <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                          <h1>View Tenant's Rental</h1>
                          <p>Rentals / View Rental</p>
                        </div>
                      </header>
                      <div className="view-rental-tenant-summary">
                        <div className="view-rental-avatar">
                          {unit.tenant_profile_picture ? (
                            <img
                              src={unit.tenant_profile_picture}
                              alt={`${tenantName} profile`}
                            />
                          ) : (
                            <FontAwesomeIcon icon={faUser} />
                          )}
                        </div>
                        <div>
                          <h2>{tenantName}</h2>
                          <p>{unit.tenant_email || fallbackEmail}</p>
                          <p>{unit.tenant_contact || "0917 123 4567"}</p>
                          <span className="view-rental-status occupied">
                            Occupied
                          </span>
                        </div>
                      </div>
                    </section>
                    <section className="view-rental-card">
                      <h2 className="view-rental-section-title">
                        <FontAwesomeIcon icon={faHouse} /> Rental Information
                      </h2>
                      <div className="view-rental-data-grid">
                        <div>
                          <span>Unit Number</span>
                          <strong>{unit.unit}</strong>
                        </div>
                        <div>
                          <span>Monthly Rent</span>
                          <strong>{formatMoney(unit.unit_cost)}</strong>
                        </div>
                        <div>
                          <span>Move-in Date</span>
                          <strong>
                            {unit.move_in_date || sampleDetails.moveInDate}
                          </strong>
                        </div>
                        <div>
                          <span>Lease End Date</span>
                          <strong>
                            {unit.lease_end_date || sampleDetails.leaseEndDate}
                          </strong>
                        </div>
                      </div>
                    </section>
                    <section className="view-rental-card">
                      <h2 className="view-rental-section-title">
                        <FontAwesomeIcon icon={faWallet} /> Payment Summary
                      </h2>
                      <div className="view-rental-balance">
                        <span>Total Outstanding Balance</span>
                        <strong>
                          {formatMoney(
                            unit.outstanding_balance ?? sampleDetails.balance,
                          )}
                        </strong>
                      </div>
                      <div className="view-rental-last-payment">
                        <span>Last Recorded Payment</span>
                        <strong>
                          {unit.last_payment || sampleDetails.lastPayment}
                        </strong>
                      </div>
                      <p className="view-rental-sample-note">
                        Sample information for UI illustration only.
                      </p>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
