import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import api from "../../api/axios";
import DashboardContentHeader from "./Admin-Dashboard-Contents/DashboardContentHeader";
import SummaryCard from "./Admin-Dashboard-Contents/SummaryCard";
import RentalOverview from "./Admin-Dashboard-Contents/RentalOverview";
import RecentTenants from "./Admin-Dashboard-Contents/RecentTenants";
import UnitStatus from "./Admin-Dashboard-Contents/UnitStatus";
import UpcomingEvents from "./Admin-Dashboard-Contents/UpcomingEvents";
import QuickActions from "./Admin-Dashboard-Contents/QuickActions";
import RecentActivity from "./Admin-Dashboard-Contents/RecentActivity";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard/summary")
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

          <div className="page-content">
            {error && (
              <p className="dashboard-load-error" role="alert">
                {error}
              </p>
            )}
            {!dashboard && !error && (
              <p className="dashboard-load-state" role="status">
                Loading dashboard…
              </p>
            )}
            {dashboard && (
              <>
                <div className="dashboard-content-left-admin">
                  <DashboardContentHeader />
                  <SummaryCard summary={dashboard.summary} />

                  <div className="mini-contents-container">
                    <section className="mini-contents-left">
                      <RentalOverview data={dashboard.chart} />
                      <RecentTenants tenants={dashboard.recentTenants} />
                    </section>
                    <section className="mini-contents-right">
                      <UnitStatus statuses={dashboard.unitStatuses} />
                      <UpcomingEvents events={dashboard.upcomingEvents} />
                    </section>
                  </div>
                </div>
                <div className="dashboard-content-right-admin">
                  <QuickActions />
                  <RecentActivity activities={dashboard.activities} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
