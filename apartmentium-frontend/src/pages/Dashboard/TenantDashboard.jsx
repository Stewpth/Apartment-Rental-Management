import { useEffect, useState } from "react";
import LoadingState from "../../components/ui/LoadingState";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import api from "../../api/axios";
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
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/tenant/dashboard/summary")
      .then(({ data }) => setDashboard(data.data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Unable to load dashboard data.",
        ),
      );
  }, []);

  return (
    <>
      <title>Dashboard</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-dashboard">
            {error && (
              <p className="dashboard-load-error" role="alert">
                {error}
              </p>
            )}
            {!dashboard && !error && (
              <LoadingState variant="page" message="Loading your dashboard…" />
            )}
            {dashboard && (
              <>
                <div className="tenant-dashboard-main">
                  <DashboardWelcome tenantName={dashboard.tenantName} />
                  <SummaryCards dashboard={dashboard} />
                  <div className="tenant-feature-grid">
                    <RentalOverview rental={dashboard.rental} />
                    <PaymentOverview dashboard={dashboard} />
                  </div>
                  <div className="tenant-lower-grid">
                    <RecentRequests requests={dashboard.requests} />
                    <RecentPayments payments={dashboard.payments} />
                  </div>
                </div>
                <aside className="tenant-dashboard-aside">
                  <LatestAnnouncements />
                  <TenantHelpCard />
                </aside>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
