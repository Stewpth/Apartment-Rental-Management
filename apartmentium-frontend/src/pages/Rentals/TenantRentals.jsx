import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import TenantRentalSummary from "./tenant-rental-contents/TenantRentalSummary";
import TenantRentalInformation from "./tenant-rental-contents/TenantRentalInformation";
import LoadingState from "../../components/ui/LoadingState";
import EmptyState from "../../components/ui/EmptyState";
import "./TenantRentals.css";

export default function TenantRentals() {
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/tenant/rentals/me")
      .then(({ data }) => setRental(data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load your rental."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <>
      <title>My Rental | Apartmentium</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-rentals-page">
            <div className="tenant-rentals-content">
              <header className="tenant-rentals-heading">
                <h1>My Unit</h1>
                <p>View your assigned apartment and rental information.</p>
              </header>
              {loading ? <LoadingState message="Loading your rental…" /> : error ? <p role="alert">{error}</p> : rental ? <>
                <TenantRentalSummary rental={rental} />
                <TenantRentalInformation rental={rental} />
              </> : <EmptyState title="No active rental" description="There is no active rental linked to this account. Contact your property manager if you believe this is incorrect." />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
import { useEffect, useState } from "react";
import api from "../../api/axios";
