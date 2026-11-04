import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import { changeTenantPassword, getRentalUnits } from "../../../api/rentalApi";
import AvailableUnitDetails from "./AvailableUnitDetails";
import RentalInformation from "./RentalInformation";
import RentalTenantSummary from "./RentalTenantSummary";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import "../Rentals.css";
import "./ViewRentalPage.css";

export default function ViewRentalPage() {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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

  async function handleChangePassword() {
    if (!unit?.rental_id || changingPassword) return;
    if (!window.confirm(`Generate a new password and email it to ${unit.tenant_email}? The tenant's current password will stop working.`)) return;
    setChangingPassword(true);
    setPasswordStatus("");
    setPasswordError("");
    try {
      const result = await changeTenantPassword(unit.rental_id);
      setPasswordStatus(result.message || "The new password was emailed to the tenant.");
    } catch (requestError) {
      setPasswordError(requestError.response?.data?.message || "Unable to change the tenant password.");
    } finally {
      setChangingPassword(false);
    }
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
                  <LoadingState message="Loading rental details…" />
                ) : error ? (
                  <p role="alert">{error}</p>
                ) : !unit ? (
                  <EmptyState
                    title="Rental record not found"
                    description="This unit may have been removed or is no longer available. Return to the rentals list to view current records."
                    actionLabel="Back to Rentals"
                    onAction={() => navigate("/admin/rentals")}
                  />
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
                      onChangePassword={handleChangePassword}
                      changingPassword={changingPassword}
                      passwordStatus={passwordStatus}
                      passwordError={passwordError}
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
