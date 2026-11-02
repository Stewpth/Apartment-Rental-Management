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
    tenant_name: rental.tenant.fullName,
    tenant_email: rental.tenant.email,
    tenant_contact: rental.tenant.phone,
    tenant_profile_picture: rental.tenant.profileImageUrl,
    unit: displayUnitNumber(rental.unit.unitNumber),
    unit_cost: Number(rental.monthlyRent),
    isAvailable: false,
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
    isAvailable: true,
    status: unit.status,
    description: unit.description,
  };
}

export async function getRentalUnits() {
  const [rentalsResponse, availableResponse] = await Promise.all([
    api.get("/admin/rentals"),
    api.get("/admin/units/available"),
  ]);

  return [
    ...rentalsResponse.data.data.map(mapRentalToUnit),
    ...availableResponse.data.units.map(mapAvailableUnit),
  ];
}
