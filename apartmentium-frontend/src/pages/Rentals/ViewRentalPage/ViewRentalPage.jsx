import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import { initialRentalRecords } from "../admin-rental-contents/RentalRecords/rentalRecords";
import AvailableUnitDetails from "./AvailableUnitDetails";
import PaymentSummary from "./PaymentSummary";
import RentalInformation from "./RentalInformation";
import RentalTenantSummary from "./RentalTenantSummary";
import "../Rentals.css";
import "./ViewRentalPage.css";

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
                  <AvailableUnitDetails
                    unit={unit}
                    onBack={() => backToRentals()}
                    onAssignTenant={() => backToRentals(true)}
                  />
                ) : (
                  <>
                    <RentalTenantSummary
                      unit={unit}
                      tenantName={tenantName}
                      email={unit.tenant_email || fallbackEmail}
                      contact={unit.tenant_contact || "0917 123 4567"}
                      onBack={() => backToRentals()}
                    />
                    <RentalInformation unit={unit} />
                    <PaymentSummary unit={unit} />
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
