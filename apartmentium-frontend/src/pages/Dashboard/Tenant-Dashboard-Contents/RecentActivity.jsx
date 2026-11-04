import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faDroplet,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";

import TenantPanel from "./TenantPanel";
import "./RecentActivity.css";
import { NavLink } from "react-router-dom";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-PH", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
const categoryLabels = {
  REPAIR: "Repair",
  PERMISSION: "Permission",
  COMPLAINT: "Complaint",
  MOVING_OUT: "Moving out",
};
const statusLabels = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export function RecentRequests({ requests = [] }) {
  return (
    <TenantPanel title="Recent requests" icon={faScrewdriverWrench}>
      <div className="tenant-list">
        {requests.map((request) => (
          <NavLink
            className="tenant-list-row tenant-dashboard-link"
            key={request.id}
            to="/tenant/requests"
          >
            <span className="tenant-row-icon">
              <FontAwesomeIcon
                icon={
                  request.category === "COMPLAINT"
                    ? faDroplet
                    : faScrewdriverWrench
                }
              />
            </span>

            <div className="tenant-row-copy">
              <strong title={request.title}>{request.title}</strong>
              <span>
                {categoryLabels[request.category] || request.category}
              </span>
              <small>{formatDate(request.createdAt)}</small>
            </div>

            <span
              className={`tenant-status ${
                request.status === "RESOLVED"
                  ? "active"
                  : request.status === "REJECTED"
                    ? "rejected"
                    : "ongoing"
              }`}
            >
              {statusLabels[request.status] || request.status}
            </span>
          </NavLink>
        ))}
        {requests.length === 0 && (
          <p className="tenant-dashboard-empty">No requests yet.</p>
        )}
      </div>
    </TenantPanel>
  );
}

export function RecentPayments({ payments = [] }) {
  return (
    <TenantPanel title="Recent payments" icon={faCreditCard}>
      <div className="tenant-payment-list">
        {payments.map((payment) => (
          <NavLink
            className="tenant-payment-row tenant-dashboard-link"
            key={payment.id}
            to="/tenant/payments"
          >
            <div className="tenant-payment-details-dashboard">
              <span className="tenant-payment-details-label id">
                {payment.reference || `Payment ${payment.id.slice(0, 8)}`}
              </span>

              <span className="tenant-payment-details-label date">
                {formatDate(payment.date)}
              </span>
            </div>

            <div className="tenant-payment-stats-dashboard">
              <strong>₱{Number(payment.amount).toLocaleString("en-PH")}</strong>
              <span className="tenant-status active">Recorded</span>
            </div>
          </NavLink>
        ))}
        {payments.length === 0 && (
          <p className="tenant-dashboard-empty">No payments recorded yet.</p>
        )}
      </div>
    </TenantPanel>
  );
}
