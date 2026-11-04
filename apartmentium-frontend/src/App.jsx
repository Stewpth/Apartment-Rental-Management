import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { HomeRedirect, ProtectedRoute } from "./auth/ProtectedRoute";
import LoadingState from "./components/ui/LoadingState";

const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const Rentals = lazy(() => import("./pages/Rentals/Rentals"));
const TenantRentals = lazy(() => import("./pages/Rentals/TenantRentals"));
const ViewRentalPage = lazy(() => import("./pages/Rentals/ViewRentalPage/ViewRentalPage"));
const Payments = lazy(() => import("./pages/Payments/Payments"));
const TenantPayments = lazy(() => import("./pages/Payments/TenantPayments"));
const ViewPayments = lazy(() => import("./pages/Payments/ViewPayments/ViewPayments"));
const Requests = lazy(() => import("./pages/Request/Requests"));
const TenantRequests = lazy(() => import("./pages/Request/TenantRequests"));
const ViewRequest = lazy(() => import("./pages/Request/ViewRequest/ViewRequest"));
const Announcements = lazy(() => import("./pages/Announcements/Announcements"));
const TenantDashboard = lazy(() => import("./pages/Dashboard/TenantDashboard"));
const ProfilePage = lazy(() => import("./pages/Account/ProfilePage"));
const SecuritySettingsPage = lazy(() => import("./pages/Account/SecuritySettingsPage"));
const Login = lazy(() => import("./pages/Login"));

function LoginRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingState message="Checking your session…" />;
  if (user) return <HomeRedirect />;
  return <Login />;
}

function App() {
  return (
    <Suspense fallback={<LoadingState variant="page" message="Loading page…" />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route path="/admin/settings" element={<SecuritySettingsPage />} />
          <Route path="/admin/rentals" element={<Rentals />} />
          <Route path="/admin/rentals/:unitId" element={<ViewRentalPage />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/payments/:id" element={<ViewPayments />} />
          <Route path="/admin/requests" element={<Requests />} />
          <Route path="/admin/requests/:id" element={<ViewRequest />} />
          <Route path="/admin/announcements" element={<Announcements />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["TENANT"]} />}>
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/tenant/profile" element={<ProfilePage />} />
          <Route path="/tenant/settings" element={<SecuritySettingsPage />} />
          <Route path="/tenant/rentals" element={<TenantRentals />} />
          <Route path="/tenant/payments" element={<TenantPayments />} />
          <Route path="/tenant/requests" element={<TenantRequests />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default App;





