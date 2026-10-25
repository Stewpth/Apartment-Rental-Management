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
    id: "req-1",
    icon: faDroplet,
    title: "Leaking faucet",
    type: "Repair",
    date: "Oct 18, 2026",
    status: "Ongoing",
  },
  {
    id: "req-2",
    icon: faScrewdriverWrench,
    title: "Request for early check-in",
    type: "Permission",
    date: "Oct 10, 2026",
    status: "Resolved",
  },
  {
    id: "req-3",
    icon: faDroplet,
    title: "Bathroom drain issue",
    type: "Repair",
    date: "Oct 8, 2026",
    status: "Ongoing",
  },
];

const payments = [
  { id: "pmt-11052026", date: "Oct 5, 2026", amount: "₱4,500" },
  { id: "pmt-21052026", date: "Sep 5, 2026", amount: "₱4,500" },
  { id: "pmt-31052026", date: "Aug 5, 2026", amount: "₱4,500" },
];

export function RecentRequests() {
  const recentRequests = requests.slice(0, 3);

  return (
    <TenantPanel title="Recent requests" icon={faScrewdriverWrench}>
      <div className="tenant-list">
        {recentRequests.map((request) => (
          <article className="tenant-list-row" key={request.id}>
            <span className="tenant-row-icon">
              <FontAwesomeIcon icon={request.icon} />
            </span>

            <div className="tenant-row-copy">
              <strong title={request.title}>{request.title}</strong>
              <span>{request.type}</span>
              <small>{request.date}</small>
            </div>

            <span
              className={`tenant-status ${
                request.status === "Resolved" ? "active" : "ongoing"
              }`}
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
  const recentPayments = payments.slice(0, 3);

  return (
    <TenantPanel title="Recent payments" icon={faCreditCard}>
      <div className="tenant-payment-list">
        {recentPayments.map((payment) => (
          <div className="tenant-payment-row" key={payment.id}>
            <div className="tenant-payment-details-dashboard">
              <span className="tenant-payment-details-label id">
                {payment.id}
              </span>

              <span className="tenant-payment-details-label date">
                {payment.date}
              </span>
            </div>

            <div className="tenant-payment-stats-dashboard">
              <strong>{payment.amount}</strong>
              <span className="tenant-status active">Recorded</span>
            </div>
          </div>
        ))}
      </div>
    </TenantPanel>
  );
}
