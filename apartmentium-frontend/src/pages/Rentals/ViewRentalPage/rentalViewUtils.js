export const sampleRentalDetails = {
  moveInDate: "October 1, 2026",
  leaseEndDate: "September 30, 2027",
  balance: 10000,
  lastPayment: "Oct 5, 2026",
};

export function formatMoney(value) {
  return `\u20B1${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
