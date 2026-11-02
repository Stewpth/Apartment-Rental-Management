import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RentalsHeader from "./admin-rental-contents/RentalsHeader";
import RentalsSummary from "./admin-rental-contents/RentalsSummary";
import RentalsRecords from "./admin-rental-contents/RentalRecords";
import { getRentalUnits } from "./rentalApi";
import "./Rentals.css";

export default function Rentals() {
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUnits = useCallback(async () => {
    try {
      setUnits(await getRentalUnits());
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load rental records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  return (
    <>
      <title>Rentals</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="rentals-container">
              <div className="rentals-contents">
                <RentalsHeader />
                <RentalsSummary units={units} />
                {error && <p className="rentals-error" role="alert">{error}</p>}
                {loading ? <p>Loading rental records…</p> : <RentalsRecords units={units} onRefresh={loadUnits} initialUnitId={location.state?.assignUnitId} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
