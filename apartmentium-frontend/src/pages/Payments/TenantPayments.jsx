import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import TenantPaymentsHeader from "./tenant-payment-contents/TenantPaymentsHeader";
import PaymentSummaryCards from "./tenant-payment-contents/PaymentSummaryCards";
import TenantPaymentHistory from "./tenant-payment-contents/TenantPaymentHistory";
import TenantPaymentSidebar from "./tenant-payment-contents/TenantPaymentSidebar";
import "./TenantPayments.css";

import { useEffect, useState } from "react";
import api from "../../api/axios";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";

export default function TenantPayments() {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/tenant/payments/me")
      .then(({ data }) => setPayments(data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your payment information."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <title>My Payments | Apartmentium</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-payments-page">
            {loading ? <LoadingState message="Loading your payment information…" /> : error ? <p className="payments-error" role="alert">{error}</p> : payments ? <>
              <div className="tenant-payments-main">
                <TenantPaymentsHeader />
                <PaymentSummaryCards summary={payments.summary} />
                <TenantPaymentHistory payments={payments.payments} />
              </div>
              <TenantPaymentSidebar summary={payments.summary} rental={payments.rental} />
            </> : <EmptyState title="No payment information" description="An active rental is required before payment information is available." />}
          </div>
        </main>
      </div>
    </>
  );
}
