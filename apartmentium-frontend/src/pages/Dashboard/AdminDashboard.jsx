import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import DashboardContentHeader from "./Admin-Dashboard-Contents/DashboardContentHeader";
import SummaryCard from "./Admin-Dashboard-Contents/SummaryCard";

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
            </div>
            <div className="dashboard-content-right-admin">hello</div>
          </div>
        </main>
      </div>
    </>
  );
}
