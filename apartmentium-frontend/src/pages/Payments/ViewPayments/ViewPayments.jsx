import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";
import PaymentDetailsHeader from "./components/PaymentDetailsHeader";
import PaymentSummary from "./components/PaymentSummary";
import PaymentBreakdown from "./components/PaymentBreakdown";
import PaymentHistory from "./components/PaymentHistory";
import RecordPaymentModal from "./components/RecordPaymentModal";
import LoadingState from "../../../components/ui/LoadingState";
import EmptyState from "../../../components/ui/EmptyState";
import { formatPaymentAmount, formatPaymentDate, formatBillingPeriod } from "../paymentUtils";

import "./ViewPayments.css";

export default function ViewPayments() {
  const { id: rentalId } = useParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const loadPaymentDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/admin/payments/${rentalId}`);
      setPaymentDetails(data.data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load payment details.");
    } finally {
      setLoading(false);
    }
  }, [rentalId]);

  useEffect(() => { loadPaymentDetails(); }, [loadPaymentDetails]);

  async function recordPayment({ amount, note }) {
    await api.post(`/admin/payments/${rentalId}`, { amount, note });
    await loadPaymentDetails();
    setIsRecordingPayment(false);
  }

  const unitNumber = paymentDetails?.unit.unitNumber.replace(/^unit\s*/i, "");

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
                {loading ? <LoadingState message="Loading payment details…" /> : error ? <p className="payments-error" role="alert">{error}</p> : !paymentDetails ? <EmptyState title="Payment record not found" description="This rental may no longer be active." /> : <>
                <PaymentDetailsHeader
                  tenantName={paymentDetails.tenant.fullName}
                  unit={unitNumber}
                  canRecordPayment={Number(paymentDetails.totalDue) > 0}
                  onRecordPayment={() => setIsRecordingPayment(true)}
                />
                <PaymentSummary
                  totalDue={formatPaymentAmount(paymentDetails.totalDue)}
                  monthlyRent={formatPaymentAmount(paymentDetails.monthlyRent)}
                />
                <PaymentBreakdown items={paymentDetails.dues.filter((due) => Number(due.balance) > 0).map((due) => ({
                  period: formatBillingPeriod(due.billingPeriod),
                  dueDate: formatPaymentDate(due.dueDate),
                  amount: formatPaymentAmount(due.balance),
                }))} />
                <PaymentHistory payments={paymentDetails.payments.map((payment) => ({
                  id: payment.id,
                  date: formatPaymentDate(payment.date),
                  amount: formatPaymentAmount(payment.amount),
                  note: payment.note || payment.reference || "—",
                }))} />
                </>}
              </div>
            </div>
          </div>
        </main>
      </div>
      {isRecordingPayment && (
        <RecordPaymentModal
          tenantName={paymentDetails.tenant.fullName}
          unit={unitNumber}
          totalDue={Number(paymentDetails?.totalDue || 0)}
          onClose={() => setIsRecordingPayment(false)}
          onSubmit={recordPayment}
        />
      )}
    </>
  );
}
