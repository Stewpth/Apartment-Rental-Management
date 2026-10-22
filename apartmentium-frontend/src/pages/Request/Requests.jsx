import { useState } from "react";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RequestsHeader from "./RequestsHeader";
import SearchRequests from "./SearchRequests";
import RequestsTable from "./RequestsTable";
import "./Requests.css";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <title>Rentals</title>

      <div className="page-container">
        <Sidebar />

        <main className="page-main">
          <Header />

          <div className="page-content">
            <div className="request-container">
              <div className="request-contents">
                <RequestsHeader />
                <SearchRequests
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
                <RequestsTable searchTerm={searchTerm} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
