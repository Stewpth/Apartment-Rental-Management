import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import {
  activateRentalTenant,
  changeTenantPassword,
  getRentalUnits,
  resendRentalTenantActivationOtp,
  setUnitAvailableStatus,
  setUnitMaintenanceStatus,
} from "../../../api/rentalApi";
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
  const [activatingTenant, setActivatingTenant] = useState(false);
  const [activationStatus, setActivationStatus] = useState("");
  const [activationError, setActivationError] = useState("");
  const [resendingActivationOtp, setResendingActivationOtp] = useState(false);
  const [resendActivationStatus, setResendActivationStatus] = useState("");
  const [resendActivationError, setResendActivationError] = useState("");
  const [settingMaintenance, setSettingMaintenance] = useState(false);
  const [maintenanceStatus, setMaintenanceStatus] = useState("");
  const [maintenanceError, setMaintenanceError] = useState("");
  const [settingAvailable, setSettingAvailable] = useState(false);

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
    if (
      !window.confirm(
        `Generate a new password and email it to ${unit.tenant_email}? The tenant's current password will stop working.`,
      )
    )
      return;
    setChangingPassword(true);
    setPasswordStatus("");
    setPasswordError("");
    try {
      const result = await changeTenantPassword(unit.rental_id);
      setPasswordStatus(
        result.message || "The new password was emailed to the tenant.",
      );
    } catch (requestError) {
      setPasswordError(
        requestError.response?.data?.message ||
          "Unable to change the tenant password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleActivateTenant(otp) {
    if (!unit?.rental_id || activatingTenant) return;
    setActivatingTenant(true);
    setActivationStatus("");
    setActivationError("");
    try {
      const result = await activateRentalTenant(unit.rental_id, otp);
      setUnit((current) => ({ ...current, tenant_account_status: "ACTIVE" }));
      setActivationStatus(result.message || "Tenant account activated.");
    } catch (requestError) {
      setActivationError(
        requestError.response?.data?.message ||
          "Unable to activate tenant account.",
      );
    } finally {
      setActivatingTenant(false);
    }
  }

  async function handleResendActivationOtp() {
    if (!unit?.rental_id || resendingActivationOtp) return;
    setResendingActivationOtp(true);
    setResendActivationStatus("");
    setResendActivationError("");
    try {
      const result = await resendRentalTenantActivationOtp(unit.rental_id);
      setResendActivationStatus(
        result.message || "A new OTP was sent to the tenant.",
      );
      return result;
    } catch (requestError) {
      setResendActivationError(
        requestError.response?.data?.message ||
          "Unable to resend the activation OTP.",
      );
    } finally {
      setResendingActivationOtp(false);
    }
  }

  async function handleSetMaintenanceStatus() {
    if (!unit?.unit_id || !unit.isAvailable || settingMaintenance) return;
    setSettingMaintenance(true);
    setMaintenanceStatus("");
    setMaintenanceError("");
    try {
      const result = await setUnitMaintenanceStatus(unit.unit_id);
      setUnit((current) => ({
        ...current,
        status: "MAINTENANCE",
        unit_status: "MAINTENANCE",
        isAvailable: false,
        isMaintenance: true,
      }));
      setMaintenanceStatus(result.message || "Unit set to maintenance.");
    } catch (requestError) {
      setMaintenanceError(
        requestError.response?.data?.message ||
          "Unable to set unit to maintenance.",
      );
    } finally {
      setSettingMaintenance(false);
    }
  }

  async function handleSetAvailableStatus() {
    if (!unit?.unit_id || !unit.isMaintenance || settingAvailable) return;
    setSettingAvailable(true);
    setMaintenanceStatus("");
    setMaintenanceError("");
    try {
      const result = await setUnitAvailableStatus(unit.unit_id);
      setUnit((current) => ({
        ...current,
        status: "AVAILABLE",
        unit_status: "AVAILABLE",
        isAvailable: true,
        isMaintenance: false,
      }));
      setMaintenanceStatus(result.message || "Unit marked available.");
    } catch (requestError) {
      setMaintenanceError(
        requestError.response?.data?.message ||
          "Unable to mark unit available.",
      );
    } finally {
      setSettingAvailable(false);
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
                ) : unit.isAvailable || unit.isMaintenance ? (
                  <AvailableUnitDetails
                    unit={unit}
                    onBack={() => backToRentals()}
                    onAssignTenant={() => backToRentals(true)}
                    onSetMaintenanceStatus={handleSetMaintenanceStatus}
                    onSetAvailableStatus={handleSetAvailableStatus}
                    settingMaintenance={settingMaintenance}
                    settingAvailable={settingAvailable}
                    maintenanceStatus={maintenanceStatus}
                    maintenanceError={maintenanceError}
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
                      accountStatus={unit.tenant_account_status}
                      onActivateTenant={handleActivateTenant}
                      activatingTenant={activatingTenant}
                      activationStatus={activationStatus}
                      activationError={activationError}
                      onResendActivationOtp={handleResendActivationOtp}
                      resendingActivationOtp={resendingActivationOtp}
                      resendActivationStatus={resendActivationStatus}
                      resendActivationError={resendActivationError}
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
