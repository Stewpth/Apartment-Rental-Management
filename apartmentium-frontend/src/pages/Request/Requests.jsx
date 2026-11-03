import { useEffect, useState } from "react";
import api from "../../api/axios";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RequestsHeader from "./RequestsHeader";
import SearchRequests from "./SearchRequests";
import RequestsTable from "./RequestsTable";
import "./Requests.css";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/admin/requests")
      .then(({ data }) => setRequests(data.data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Unable to load requests.",
        ),
      );
  }, []);

  return (
    <>
      <title>Requests</title>

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
                {error && (
                  <p role="alert" className="payments-error">
                    {error}
                  </p>
                )}
                <RequestsTable searchTerm={searchTerm} requests={requests} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
