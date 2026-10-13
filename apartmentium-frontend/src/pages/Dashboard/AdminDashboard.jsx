import Sidebar from "../../components/layout/Sidebar";
import "./Dashboard.css";

export default function AdminDashboard() {
  return (
    <>
      <title>Dashboard</title>
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          <h1>Dashboard</h1>
          <p>Welcome to the Dashboard!</p>
        </main>
      </div>
    </>
  );
}
