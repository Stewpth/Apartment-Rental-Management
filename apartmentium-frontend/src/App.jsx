import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import Rentals from "./pages/Rentals/Rentals";
import Payments from "./pages/Payments/Payments";
import ViewPayments from "./pages/Payments/ViewPayments/ViewPayments";
import Requests from "./pages/Request/Requests";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/rentals" element={<Rentals />} />

      <Route path="/admin/payments" element={<Payments />} />
      <Route path="/admin/payments/:id" element={<ViewPayments />} />
      <Route path="/admin/requests" element={<Requests />} />
    </Routes>
  );
}

export default App;
