import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import DashboardWelcome from "./Tenant-Dashboard-Contents/DashboardWelcome";
import SummaryCards from "./Tenant-Dashboard-Contents/SummaryCards";
import {
  PaymentOverview,
  RentalOverview,
} from "./Tenant-Dashboard-Contents/RentalOverview";
import {
  RecentPayments,
  RecentRequests,
} from "./Tenant-Dashboard-Contents/RecentActivity";
import {
  LatestAnnouncements,
  TenantHelpCard,
} from "./Tenant-Dashboard-Contents/DashboardAnnouncements";
import "./TenantDashboard.css";

export default function TenantDashboard() {
  return (
    <>
      <title>Dashboard</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-dashboard">
            <div className="tenant-dashboard-main">
              <DashboardWelcome />
              <SummaryCards />
              <div className="tenant-feature-grid">
                <RentalOverview />
                <PaymentOverview />
              </div>
              <div className="tenant-lower-grid">
                <RecentRequests />
                <RecentPayments />
              </div>
            </div>
            <aside className="tenant-dashboard-aside">
              <LatestAnnouncements />
              <TenantHelpCard />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
