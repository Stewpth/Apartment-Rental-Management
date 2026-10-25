import { useState } from "react";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RentalsHeader from "./admin-rental-contents/RentalsHeader";
import RentalsSummary from "./admin-rental-contents/RentalsSummary";
import RentalsRecords from "./admin-rental-contents/RentalRecords";
import "./Rentals.css";

export default function Rentals() {
  const [newUnits, setNewUnits] = useState([]);

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
                <RentalsSummary additionalUnits={newUnits.length} />
                <RentalsRecords newUnits={newUnits} setNewUnits={setNewUnits} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
