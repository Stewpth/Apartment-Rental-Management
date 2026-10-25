import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import TenantPaymentsHeader from "./tenant-payment-contents/TenantPaymentsHeader";
import PaymentSummaryCards from "./tenant-payment-contents/PaymentSummaryCards";
import TenantPaymentHistory from "./tenant-payment-contents/TenantPaymentHistory";
import TenantPaymentSidebar from "./tenant-payment-contents/TenantPaymentSidebar";
import "./TenantPayments.css";

export default function TenantPayments() {
  return (
    <>
      <title>My Payments | Apartmentium</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-payments-page">
            <div className="tenant-payments-main">
              <TenantPaymentsHeader />
              <PaymentSummaryCards />
              <TenantPaymentHistory />
            </div>
            <TenantPaymentSidebar />
          </div>
        </main>
      </div>
    </>
  );
}
