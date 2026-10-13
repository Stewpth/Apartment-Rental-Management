import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
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
            <h1>Dashboard</h1>
            <p>Welcome to the Dashboard!</p>
          </div>
        </main>
      </div>
    </>
  );
}
