import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import PaymentDetailsHeader from "./components/PaymentDetailsHeader";
import PaymentSummary from "./components/PaymentSummary";
import PaymentBreakdown from "./components/PaymentBreakdown";
import PaymentHistory from "./components/PaymentHistory";

import "./ViewPayments.css";

// I will convert it to database after frontend.
const paymentDetails = {
  tenantName: "Maria Santos",
  unit: "102",
  totalDue: "\u20B19,000.00",
  monthlyRent: "\u20B14,500.00",
  breakdown: [
    {
      period: "September 2026",
      dueDate: "Sep 10, 2026",
      amount: "\u20B14,500.00",
    },
    {
      period: "October 2026",
      dueDate: "Oct 10, 2026",
      amount: "\u20B14,500.00",
    },
  ],
  history: [{ date: "Aug 10, 2026", amount: "\u20B14,500.00", note: "-" }],
};

export default function ViewPayments() {
  return (
    <>
      <title>Payment Details</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="view-payments-container">
              <div className="view-payments-contents">
                <PaymentDetailsHeader
                  tenantName={paymentDetails.tenantName}
                  unit={paymentDetails.unit}
                />
                <PaymentSummary
                  totalDue={paymentDetails.totalDue}
                  monthlyRent={paymentDetails.monthlyRent}
                />
                <PaymentBreakdown items={paymentDetails.breakdown} />
                <PaymentHistory payments={paymentDetails.history} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
