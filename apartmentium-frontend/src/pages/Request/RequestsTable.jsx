import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faSpinner,
  faCircleCheck,
  faCircleXmark,
  faScrewdriverWrench,
  faClipboardCheck,
  faCommentDots,
  faTruckMoving,
} from "@fortawesome/free-solid-svg-icons";
import "./RequestsTable.css";

const statusLabels = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};
const statusIcons = {
  PENDING: faClock,
  IN_PROGRESS: faSpinner,
  RESOLVED: faCircleCheck,
  REJECTED: faCircleXmark,
};
const categoryLabels = {
  REPAIR: "Repair",
  PERMISSION: "Permission",
  COMPLAINT: "Complaint",
  MOVING_OUT: "Moving Out",
};
const categoryIcons = {
  REPAIR: faScrewdriverWrench,
  PERMISSION: faClipboardCheck,
  COMPLAINT: faCommentDots,
  MOVING_OUT: faTruckMoving,
};

export default function RequestsTable({ searchTerm, requests = [] }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const filtered = requests.filter((request) =>
    [
      request.tenant.fullName,
      request.tenant.unitNumber,
      request.title,
      request.status,
      request.category,
      request.createdAt,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  useEffect(() => setCurrentPage(1), [searchTerm]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);
  return (
    <>
      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Status</th>
              <th>Category</th>
              <th>Date Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(start, start + pageSize).map((request) => (
              <tr
                key={request.id}
                className="requests-row"
                tabIndex={0}
                onClick={() => navigate(`/admin/requests/${request.id}`)}
                onKeyDown={(event) =>
                  event.key === "Enter" &&
                  navigate(`/admin/requests/${request.id}`)
                }
              >
                <td className="request-tenant-details">
                  <span className="request-name">
                    {request.tenant.fullName}
                  </span>
                  <span className="request-unit">
                    Unit {request.tenant.unitNumber}
                  </span>
                </td>
                <td>
                  <span
                    className={`request-status ${request.status.toLowerCase()}`}
                  >
                    <FontAwesomeIcon
                      aria-hidden="true"
                      icon={statusIcons[request.status]}
                    />{" "}
                    {statusLabels[request.status]}
                  </span>
                </td>
                <td>
                  <span
                    className={`request-category ${request.category.toLowerCase()}`}
                  >
                    <FontAwesomeIcon
                      aria-hidden="true"
                      icon={categoryIcons[request.category]}
                    />{" "}
                    {categoryLabels[request.category]}
                  </span>
                </td>
                <td>
                  {new Intl.DateTimeFormat("en-PH", {
                    dateStyle: "medium",
                  }).format(new Date(request.createdAt))}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan="4" className="requests-empty">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="requests-pagination">
        <span className="pagination-info">
          Showing {filtered.length ? start + 1 : 0} to{" "}
          {Math.min(start + pageSize, filtered.length)} of {filtered.length}{" "}
          requests
        </span>
        <div className="pagination-buttons">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
