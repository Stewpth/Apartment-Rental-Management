import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import Rentals from "./pages/Rentals/Rentals";
import Payments from "./pages/Payments/Payments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/rentals" element={<Rentals />} />
      <Route path="/admin/payments" element={<Payments />} />
    </Routes>
  );
}

export default App;
