import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faClipboardCheck,
  faScrewdriverWrench,
  faCommentDots,
  faTruckMoving,
} from "@fortawesome/free-solid-svg-icons";
import "./TenantRequestList.css";

const pageSize = 5;

const statusLabels = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};
const categoryIcons = {
  REPAIR: faScrewdriverWrench,
  PERMISSION: faClipboardCheck,
  COMPLAINT: faCommentDots,
  MOVING_OUT: faTruckMoving,
};
const categoryLabels = {
  REPAIR: "Repair",
  PERMISSION: "Permission",
  COMPLAINT: "Complaint",
  MOVING_OUT: "Moving Out",
};

export default function TenantRequestList({
  requests,
  currentPage,
  onPageChange,
  onSelectRequest,
}) {
  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRequests = requests.slice(startIndex, startIndex + pageSize);
  const firstItem = requests.length ? startIndex + 1 : 0;
  const lastItem = Math.min(startIndex + pageSize, requests.length);

  useEffect(() => {
    if (currentPage > totalPages) onPageChange(totalPages);
  }, [currentPage, onPageChange, totalPages]);

  return (
    <section className="tenant-request-list" aria-label="Submitted requests">
      <div className="tenant-request-list-items">
        {visibleRequests.map((request) => (
          <article className="tenant-request-card" key={request.id}>
            <span
              className={`tenant-request-icon ${request.category.toLowerCase()}`}
              aria-hidden="true"
            >
              <FontAwesomeIcon icon={categoryIcons[request.category]} />
            </span>
            <div className="tenant-request-details">
              <h2>{request.title}</h2>
              <span className="tenant-request-meta">
                {categoryLabels[request.category]} · Submitted{" "}
                {new Intl.DateTimeFormat("en-PH", {
                  dateStyle: "medium",
                }).format(new Date(request.createdAt))}
              </span>
              <p>{request.description}</p>
              <span
                className={`tenant-request-status ${request.status.toLowerCase()}`}
              >
                {statusLabels[request.status]}
              </span>
            </div>
            <button
              className="tenant-request-view"
              type="button"
              onClick={() => onSelectRequest(request)}
            >
              View Details <span aria-hidden="true">→</span>
            </button>
          </article>
        ))}
      </div>
      <footer className="tenant-request-pagination">
        <span>
          Showing {firstItem} to {lastItem} of {requests.length} requests
        </span>
        <nav aria-label="Request pages">
          <button
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => onPageChange((page) => Math.max(1, page - 1))}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={currentPage === pageNumber ? "current" : ""}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() =>
              onPageChange((page) => Math.min(totalPages, page + 1))
            }
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </nav>
      </footer>
    </section>
  );
}
