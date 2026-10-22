import { useState } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import PaymentDetailsHeader from "./components/PaymentDetailsHeader";
import PaymentSummary from "./components/PaymentSummary";
import PaymentBreakdown from "./components/PaymentBreakdown";
import PaymentHistory from "./components/PaymentHistory";
import RecordPaymentModal from "./components/RecordPaymentModal";

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
  const [totalDue, setTotalDue] = useState(9000);
  const [history, setHistory] = useState(paymentDetails.history);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  function recordPayment({ amount, note }) {
    setHistory((current) => [
      { date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date()), amount: new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount), note: note || "-" },
      ...current,
    ]);
    setTotalDue((current) => Math.max(0, current - amount));
    setIsRecordingPayment(false);
  }

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
                  onRecordPayment={() => setIsRecordingPayment(true)}
                />
                <PaymentSummary
                  totalDue={new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(totalDue)}
                  monthlyRent={paymentDetails.monthlyRent}
                />
                <PaymentBreakdown items={paymentDetails.breakdown} />
                <PaymentHistory payments={history} />
              </div>
            </div>
          </div>
        </main>
      </div>
      {isRecordingPayment && (
        <RecordPaymentModal
          tenantName={paymentDetails.tenantName}
          unit={paymentDetails.unit}
          totalDue={totalDue}
          onClose={() => setIsRecordingPayment(false)}
          onSubmit={recordPayment}
        />
      )}
    </>
  );
}
