import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import { getRentalUnits } from "../rentalApi";
import AvailableUnitDetails from "./AvailableUnitDetails";
import RentalInformation from "./RentalInformation";
import RentalTenantSummary from "./RentalTenantSummary";
import "../Rentals.css";
import "./ViewRentalPage.css";

export default function ViewRentalPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getRentalUnits()
      .then((units) => {
        if (active)
          setUnit(units.find((record) => record.unit_id === unitId) || null);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Unable to load this rental.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [unitId]);

  function backToRentals(assignTenant = false) {
    navigate("/admin/rentals", {
      state: {
        unit,
        ...(assignTenant && unit ? { assignUnitId: unit.unit_id } : {}),
      },
    });
  }

  const tenantName = unit?.tenant_name || "No Tenant Assigned";

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
                {loading ? (
                  <p>Loading rental details…</p>
                ) : error ? (
                  <p role="alert">{error}</p>
                ) : !unit ? (
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
                      email={unit.tenant_email || "Email unavailable"}
                      contact={unit.tenant_contact || "Phone unavailable"}
                      onBack={() => backToRentals()}
                    />
                    <RentalInformation unit={unit} />
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
