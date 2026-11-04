import { useEffect, useState } from "react";
import api from "../../api/axios";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import RequestsHeader from "./RequestsHeader";
import SearchRequests from "./SearchRequests";
import RequestsTable from "./RequestsTable";
import LoadingState from "../../components/ui/LoadingState";
import "./Requests.css";

export default function Requests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api
      .get("/admin/requests")
      .then(({ data }) => {
        if (active) setRequests(data.data);
      })
      .catch((requestError) =>
        active && setError(
          requestError.response?.data?.message || "Unable to load requests.",
        ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
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
                {loading ? (
                  <LoadingState message="Loading requests…" />
                ) : !error ? (
                  <RequestsTable searchTerm={searchTerm} requests={requests} />
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
