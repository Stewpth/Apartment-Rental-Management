import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import DashboardContentHeader from "./Admin-Dashboard-Contents/DashboardContentHeader";
import SummaryCard from "./Admin-Dashboard-Contents/SummaryCard";
import RentalOverview from "./Admin-Dashboard-Contents/RentalOverview";
import RecentTenants from "./Admin-Dashboard-Contents/RecentTenants";
import UnitStatus from "./Admin-Dashboard-Contents/UnitStatus";
import UpcomingEvents from "./Admin-Dashboard-Contents/UpcomingEvents";
import QuickActions from "./Admin-Dashboard-Contents/QuickActions";
import RecentActivity from "./Admin-Dashboard-Contents/RecentActivity";

import "./AdminDashboard.css";
import "./Dashboard.css";

export default function AdminDashboard() {
  return (
    <>
      <title>Dashboard</title>

      <div className="dashboard-container">
        <Sidebar />

        <main className="dashboard-main">
          <Header />

          <div className="dashboard-content">
            <div className="dashboard-content-left-admin">
              <DashboardContentHeader />
              <SummaryCard />

              <div className="mini-contents-container">
                <section className="mini-contents-left">
                  <RentalOverview />
                  <RecentTenants />
                </section>
                <section className="mini-contents-right">
                  <UnitStatus />
                  <UpcomingEvents />
                </section>
              </div>
            </div>
            <div className="dashboard-content-right-admin">
              <QuickActions />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
