import { useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import PaymentsHeader from "./PaymentsHeader";
import PaymentsTable from "./PaymentsTable";

import "./Payments.css";

export default function Payment() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <title>Payment</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content">
            <div className="payments-container">
              <div className="payments-contents">
                <PaymentsHeader
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
                <PaymentsTable searchTerm={searchTerm} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
