import { useCallback, useEffect, useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import api from "../../api/axios";
import TenantRequestsHeader from "./tenant-request-contents/TenantRequestsHeader";
import TenantRequestSummary from "./tenant-request-contents/TenantRequestSummary";
import TenantRequestList from "./tenant-request-contents/TenantRequestList";
import TenantRequestModal from "./tenant-request-contents/TenantRequestModal";
import { isAfterTodayInManila } from "../../utils/manilaDate";
import "./TenantRequests.css";

export default function TenantRequests() {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRequest, setActiveRequest] = useState(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/tenant/requests/me");
      setRequests(data.data);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load your requests.");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function handleCreateRequest(formValues) {
    if (
      formValues.category === "MOVING_OUT" &&
      !isAfterTodayInManila(formValues.requestedMoveOutDate)
    ) {
      const validationError = new Error(
        "Can't make request, make sure that your moving out date is tomorrow.",
      );
      validationError.response = {
        data: { message: validationError.message },
      };
      throw validationError;
    }
    await api.post("/tenant/requests", formValues);
    await load();
    setCurrentPage(1);
    setIsNewRequestOpen(false);
  }
  return (
    <>
      <title>My Requests</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-requests-page">
            <div className="tenant-requests-content">
              <TenantRequestsHeader
                onNewRequest={() => setIsNewRequestOpen(true)}
              />
              {error && (
                <p role="alert" className="payments-error">
                  {error}
                </p>
              )}
              <TenantRequestSummary requests={requests} />
              <TenantRequestList
                requests={requests}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onSelectRequest={setActiveRequest}
              />
            </div>
          </div>
        </main>
      </div>
      {(isNewRequestOpen || activeRequest) && (
        <TenantRequestModal
          request={activeRequest}
          onClose={() => {
            setIsNewRequestOpen(false);
            setActiveRequest(null);
          }}
          onSubmit={handleCreateRequest}
        />
      )}
    </>
  );
}
