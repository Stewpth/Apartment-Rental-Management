import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingState from "../../../components/ui/LoadingState";
import {
  faChevronLeft,
  faChevronRight,
  faBullhorn,
  faDoorOpen,
  faMoneyBillWave,
  faScrewdriverWrench,
  faUserPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../api/axios";

import "./RecentActivity.css";
import { NavLink } from "react-router-dom";

const activityIcons = {
  tenant: [faUserPlus, "tenant"],
  payment: [faMoneyBillWave, "payment"],
  request: [faScrewdriverWrench, "maintenance"],
  moveout: [faDoorOpen, "move-out"],
  announcement: [faBullhorn, "announcement"],
};

export default function RecentActivity({ activities = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return;
    document.body.classList.add("activities-modal-open");
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove("activities-modal-open");
      triggerRef.current?.focus();
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    let active = true;
    setLoading(true);
    api
      .get(`/admin/dashboard/activities?page=${page}`)
      .then(({ data }) => {
        if (active) {
          setPageData(data.data);
          setPage(data.data.page);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "Unable to load activities.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isModalOpen, page]);

  useEffect(() => {
    if (!isModalOpen) return;
    function handleEscape(event) {
      if (event.key === "Escape") setIsModalOpen(false);
      if (event.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          "a[href], button:not(:disabled)",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  const openModal = () => {
    setPage(1);
    setPageData(null);
    setError("");
    setIsModalOpen(true);
  };

  function renderActivity(activity, isModal = false) {
    const [icon, color] = activityIcons[activity.type] || activityIcons.request;
    return (
      <li className="recent-activity-item" key={activity.id}>
        <span className={`recent-activity-icon ${color}`} aria-hidden="true">
          <FontAwesomeIcon icon={icon} />
        </span>
        <div className="recent-activity-details">
          <NavLink
            to={activity.path}
            onClick={() => isModal && setIsModalOpen(false)}
          >
            <strong>{activity.title}</strong>
          </NavLink>
          <span>{activity.detail}</span>
        </div>
        <time className="recent-activity-time" dateTime={activity.date}>
          {new Intl.DateTimeFormat("en-PH", {
            dateStyle: "medium",
            timeZone: "UTC",
          }).format(new Date(`${activity.date}T00:00:00Z`))}
        </time>
      </li>
    );
  }

  return (
    <section
      className="recent-activity-card"
      aria-labelledby="recent-activity-title"
    >
      <header className="recent-activity-header">
        <h2 id="recent-activity-title">Recent Activity</h2>
        <button
          ref={triggerRef}
          className="recent-activity-view-all"
          type="button"
          onClick={openModal}
        >
          View all activities
        </button>
      </header>

      <ul className="recent-activity-list">
        {activities.map((activity) => renderActivity(activity))}
        {activities.length === 0 && (
          <li className="recent-activity-empty">No recent activity.</li>
        )}
      </ul>
      {isModalOpen &&
        createPortal(
          <div
            className="activities-modal-overlay"
            onMouseDown={(event) =>
              event.target === event.currentTarget && setIsModalOpen(false)
            }
          >
            <section
              ref={dialogRef}
              className="activities-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="activities-modal-title"
            >
              <header className="activities-modal-header">
                <div>
                  <h2 id="activities-modal-title">All Activities</h2>
                  <p>Review recent rental, payment, and request activity.</p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  className="activities-modal-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close activities"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </header>
              <div className="activities-modal-list" aria-live="polite">
                {loading ? (
                  <LoadingState variant="compact" message="Loading activities…" />
                ) : error ? (
                  <p className="activities-modal-state error" role="alert">
                    {error}
                  </p>
                ) : pageData?.activities.length ? (
                  <ul className="recent-activity-list">
                    {pageData.activities.map((activity) =>
                      renderActivity(activity, true),
                    )}
                  </ul>
                ) : (
                  <p className="activities-modal-state">No activities yet.</p>
                )}
              </div>
              <footer className="activities-modal-pagination">
                <span>
                  {pageData?.total
                    ? `Page ${pageData.page} of ${pageData.totalPages} | ${pageData.total} activities`
                    : "Page 1 of 1"}
                </span>
                <div>
                  <button
                    type="button"
                    disabled={loading || page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} /> Previous
                  </button>
                  <button
                    type="button"
                    disabled={
                      loading || !pageData || page >= pageData.totalPages
                    }
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </section>
  );
}
