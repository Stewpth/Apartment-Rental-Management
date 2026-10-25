import { useState } from "react";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import TenantRequestsHeader from "./tenant-request-contents/TenantRequestsHeader";
import TenantRequestSummary from "./tenant-request-contents/TenantRequestSummary";
import TenantRequestList from "./tenant-request-contents/TenantRequestList";
import TenantRequestModal from "./tenant-request-contents/TenantRequestModal";
import { initialTenantRequests } from "./tenant-request-contents/tenantRequestData";
import "./TenantRequests.css";

function formatRequestDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function TenantRequests() {
  const [requests, setRequests] = useState(initialTenantRequests);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRequest, setActiveRequest] = useState(null);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  function handleCreateRequest(formValues) {
    const newRequest = {
      id: `tenant-request-${Date.now()}`,
      ...formValues,
      title: formValues.description.length > 55
        ? `${formValues.description.slice(0, 52).trim()}...`
        : formValues.description,
      submitted: formatRequestDate(new Date()),
      status: "not_resolved",
    };
    setRequests((currentRequests) => [newRequest, ...currentRequests]);
    setCurrentPage(1);
    setIsNewRequestOpen(false);
  }

  return (
    <>
      <title>My Requests | Apartmentium</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content tenant-requests-page">
            <div className="tenant-requests-content">
              <TenantRequestsHeader
                onNewRequest={() => setIsNewRequestOpen(true)}
              />
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


