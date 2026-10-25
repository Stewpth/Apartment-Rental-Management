import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faDroplet,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import TenantPanel from "./TenantPanel";

import "./RecentActivity.css";

const requests = [
  {
    icon: faDroplet,
    title: "Leaking faucet",
    type: "Repair",
    date: "Oct 18, 2026",
    status: "Ongoing",
  },
  {
    icon: faScrewdriverWrench,
    title: "Request for early check-in",
    type: "Permission",
    date: "Oct 10, 2026",
    status: "Resolved",
  },
];
const payments = [
  { date: "Oct 5, 2026", amount: "₱4,500" },
  { date: "Sep 5, 2026", amount: "₱4,500" },
  { date: "Aug 5, 2026", amount: "₱4,500" },
];

export function RecentRequests() {
  return (
    <TenantPanel title="Recent requests" icon={faScrewdriverWrench}>
      <div className="tenant-list">
        {requests.map((request) => (
          <article className="tenant-list-row" key={request.title}>
            <span className="tenant-row-icon">
              <FontAwesomeIcon icon={request.icon} />
            </span>
            <div className="tenant-row-copy">
              <strong>{request.title}</strong>
              <span>{request.type} · Unit 101</span>
              <small>{request.date}</small>
            </div>
            <span
              className={`tenant-status ${request.status === "Resolved" ? "active" : "ongoing"}`}
            >
              {request.status}
            </span>
          </article>
        ))}
      </div>
    </TenantPanel>
  );
}

export function RecentPayments() {
  return (
    <TenantPanel title="Recent payments" icon={faCreditCard}>
      <div className="tenant-payment-list">
        {payments.map((payment) => (
          <div className="tenant-payment-row" key={payment.date}>
            <span>{payment.date}</span>
            <strong>{payment.amount}</strong>
            <span className="tenant-status active">Recorded</span>
          </div>
        ))}
      </div>
    </TenantPanel>
  );
}
