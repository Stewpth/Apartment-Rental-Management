import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RequestsTable.css";

// At date property, i will use some external library to format that
// because in the backend, date will not be fully string.
const requests = [
  {
    id: "rqst-1",
    name: "Maria Santos",
    unit: "Unit 101",
    status: "not_resolved",
    category: "repair",
    date_created: "Oct 22, 2026",
  },
  {
    id: "rqst-2",
    name: "Juan Dela Cruz",
    unit: "Unit 102",
    status: "in_progress",
    category: "repair",
    date_created: "Oct 21, 2026",
  },
  {
    id: "rqst-3",
    name: "Ana Reyes",
    unit: "Unit 103",
    status: "resolved",
    category: "repair",
    date_created: "Oct 20, 2026",
  },
  {
    id: "rqst-4",
    name: "Pedro Garcia",
    unit: "Unit 104",
    status: "not_resolved",
    category: "permission",
    date_created: "Oct 19, 2026",
  },
  {
    id: "rqst-5",
    name: "Sofia Mendoza",
    unit: "Unit 105",
    status: "resolved",
    category: "repair",
    date_created: "Oct 18, 2026",
  },
  {
    id: "rqst-6",
    name: "Carlos Bautista",
    unit: "Unit 106",
    status: "in_progress",
    category: "repair",
    date_created: "Oct 17, 2026",
  },
  {
    id: "rqst-7",
    name: "Angela Torres",
    unit: "Unit 107",
    status: "not_resolved",
    category: "repair",
    date_created: "Oct 16, 2026",
  },
  {
    id: "rqst-8",
    name: "Miguel Flores",
    unit: "Unit 108",
    status: "resolved",
    category: "permission",
    date_created: "Oct 15, 2026",
  },
  {
    id: "rqst-9",
    name: "Isabella Cruz",
    unit: "Unit 109",
    status: "in_progress",
    category: "repair",
    date_created: "Oct 14, 2026",
  },
  {
    id: "rqst-10",
    name: "Gabriel Ramos",
    unit: "Unit 110",
    status: "not_resolved",
    category: "permission",
    date_created: "Oct 13, 2026",
  },
  {
    id: "rqst-11",
    name: "Patricia Lim",
    unit: "Unit 111",
    status: "resolved",
    category: "repair",
    date_created: "Oct 12, 2026",
  },
  {
    id: "rqst-12",
    name: "Daniel Aquino",
    unit: "Unit 112",
    status: "not_resolved",
    category: "repair",
    date_created: "Oct 11, 2026",
  },
];

export default function RequestsTable({ searchTerm }) {
  // Instead of Link, we will use useNavigate to substitute the non-link element to link.
  const navigate = useNavigate();
  // Search functionality
  const filteredRequests = requests.filter((request) => {
    const search = searchTerm.trim().toLowerCase();

    const searchableText = [
      request.name,
      request.unit,
      getRequestsStatus(request.status),
      getRequestsCategory(request.category),
      request.date_created,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  });

  // Pagination functionalities
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;

  const displayedRequests = filteredRequests.slice(
    startIndex,
    startIndex + pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  function getRequestsStatus(status) {
    switch (status) {
      case "not_resolved":
        return "Not Resolved";

      case "in_progress":
        return "In Progress";

      case "resolved":
        return "Resolved";
    }
  }

  function getRequestsCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  return (
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
          {displayedRequests.length > 0 ? (
            displayedRequests.map((request) => (
              <tr
                key={request.id}
                className="requests-row"
                onClick={() => navigate(`/admin/requests/${request.id}`)}
              >
                <td className="request-tenant-details">
                  <span className="request-name">{request.name}</span>
                  <span className="request-unit">{request.unit}</span>
                </td>

                <td>
                  <span className={`request-status ${request.status}`}>
                    {getRequestsStatus(request.status)}
                  </span>
                </td>

                <td>
                  <span className={`request-category ${request.category}`}>
                    {getRequestsCategory(request.category)}
                  </span>
                </td>

                <td>{request.date_created}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="requests-empty">
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="requests-pagination">
        <span className="pagination-info">
          Showing {filteredRequests.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + pageSize, filteredRequests.length)} of{" "}
          {filteredRequests.length} requests
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
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            disabled={totalPages === 0 || currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
