import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RentalsHeader from "./admin-rental-contents/RentalsHeader";
import RentalsSummary from "./admin-rental-contents/RentalsSummary";

import "./Rentals.css";

export default function Rentals() {
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
                <RentalsSummary />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
