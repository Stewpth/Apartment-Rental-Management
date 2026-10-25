import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import Rentals from "./pages/Rentals/Rentals";
import TenantRentals from "./pages/Rentals/TenantRentals";
import Payments from "./pages/Payments/Payments";
import ViewPayments from "./pages/Payments/ViewPayments/ViewPayments";
import Requests from "./pages/Request/Requests";
import ViewRequest from "./pages/Request/ViewRequest/ViewRequest";
import Announcements from "./pages/Announcements/Announcements";
import TenantDashboard from "./pages/Dashboard/TenantDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/rentals" element={<Rentals />} />

      <Route path="/admin/payments" element={<Payments />} />
      <Route path="/admin/payments/:id" element={<ViewPayments />} />

      <Route path="/admin/requests" element={<Requests />} />
      <Route path="/admin/requests/:id" element={<ViewRequest />} />

      <Route path="/admin/announcements" element={<Announcements />} />

      <Route path="/tenant/dashboard" element={<TenantDashboard />} />
      <Route path="/tenant/rentals" element={<TenantRentals />} />
    </Routes>
  );
}

export default App;

