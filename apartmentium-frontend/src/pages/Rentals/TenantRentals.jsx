import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import TenantRentalSummary from "./tenant-rental-contents/TenantRentalSummary";
import TenantRentalInformation from "./tenant-rental-contents/TenantRentalInformation";
import "./TenantRentals.css";

export default function TenantRentals() {
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
              <TenantRentalSummary />
              <TenantRentalInformation />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
