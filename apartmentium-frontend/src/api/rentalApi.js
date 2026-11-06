import api from "./axios";

function displayUnitNumber(unitNumber) {
  return unitNumber.toLowerCase().startsWith("unit ")
    ? unitNumber
    : `Unit ${unitNumber}`;
}

function mapRentalToUnit(rental) {
  return {
    unit_id: rental.unitId,
    rental_id: rental.id,
    tenant_id: rental.tenant.id,
    tenant_user_id: rental.tenant.userId,
    tenant_account_status: rental.tenant.accountStatus,
    tenant_name: rental.tenant.fullName,
    tenant_email: rental.tenant.email,
    tenant_contact: rental.tenant.phone,
    tenant_profile_picture: rental.tenant.profileImageUrl,
    unit: displayUnitNumber(rental.unit.unitNumber),
    unit_cost: Number(rental.monthlyRent),
    isAvailable: false,
    isMaintenance: false,
    unit_status: rental.unit.status,
    move_in_date: rental.moveInDate,
    lease_end_date: rental.endDate,
    status: rental.status,
    description: rental.unit.description,
  };
}

function mapAvailableUnit(unit) {
  return {
    unit_id: unit.id,
    tenant_id: null,
    tenant_name: null,
    unit: displayUnitNumber(unit.unitNumber),
    unit_cost: Number(unit.unitPrice),
    isAvailable: unit.status === "AVAILABLE",
    isMaintenance: unit.status === "MAINTENANCE",
    unit_status: unit.status,
    status: unit.status,
    description: unit.description,
  };
}

export async function getRentalUnits() {
  const [rentalsResponse, unitsResponse] = await Promise.all([
    api.get("/admin/rentals"),
    api.get("/admin/units/unoccupied"),
  ]);

  return [
    ...rentalsResponse.data.data.map(mapRentalToUnit),
    ...unitsResponse.data.units.map(mapAvailableUnit),
  ];
}

export async function setUnitMaintenanceStatus(unitId) {
  const response = await api.patch(`/admin/units/${unitId}/maintenance`);
  return response.data;
}

export async function setUnitAvailableStatus(unitId) {
  const response = await api.patch(`/admin/units/${unitId}/available`);
  return response.data;
}

export async function getUnitRentalHistory(unitId) {
  const response = await api.get(`/admin/units/${unitId}/rental-history`);
  return response.data.data;
}

export async function changeTenantPassword(rentalId) {
  const response = await api.post(
    `/admin/rentals/${rentalId}/change-tenant-password`,
  );
  return response.data;
}

export async function activateRentalTenant(rentalId, otp) {
  const response = await api.post(
    `/admin/rentals/${rentalId}/activate-tenant`,
    { otp },
  );
  return response.data;
}

export async function resendRentalTenantActivationOtp(rentalId) {
  const response = await api.post(
    `/admin/rentals/${rentalId}/resend-activation-otp`,
  );
  return response.data;
}
