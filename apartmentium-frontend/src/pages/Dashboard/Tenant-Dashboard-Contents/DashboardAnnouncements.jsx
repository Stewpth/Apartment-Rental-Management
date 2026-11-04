import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingState from "../../../components/ui/LoadingState";
import {
  faBullhorn,
  faHouse,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../../api/axios";
import TenantPanel from "./TenantPanel";
import "./DashboardAnnouncements.css";

export function LatestAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnnouncements = useCallback(async () => {
    try {
      const { data } = await api.get("/tenant/announcements/latest");
      setAnnouncements(data.data);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load announcements.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  useEffect(() => {
    if (!selectedAnnouncement) return;
    function handleEscape(event) {
      if (event.key === "Escape") setSelectedAnnouncement(null);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedAnnouncement]);

  async function openAnnouncement(item) {
    setSelectedAnnouncement({ ...item, read: true });
    if (item.read) return;
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === item.id
          ? { ...announcement, read: true }
          : announcement,
      ),
    );
    try {
      await api.post(`/tenant/announcements/${item.id}/read`, {});
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save announcement status.",
      );
    }
  }

  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(date));

  return (
    <>
      <TenantPanel
        title="Latest announcements"
        icon={faBullhorn}
        className="announcement-panel"
      >
        <div className="tenant-announcements">
          {loading ? (
            <LoadingState variant="inline" message="Loading announcements…" />
          ) : announcements.length === 0 ? (
            <p
              className="tenant-announcement-state"
              role={error ? "alert" : undefined}
            >
              {error || "There are no announcements yet."}
            </p>
          ) : (
            announcements.map((item) => (
              <article
                key={item.id}
                className={`tenant-announcement${item.read ? " is-read" : " is-unread"}`}
              >
                <button
                  type="button"
                  className="tenant-announcement-button"
                  aria-haspopup="dialog"
                  onClick={() => openAnnouncement(item)}
                >
                  <span className="tenant-announcement-copy">
                    <strong>{item.title}</strong>
                    <time dateTime={item.publishedAt}>
                      {formatDate(item.publishedAt)}
                    </time>
                    <span className="tenant-announcement-preview">
                      {item.content}
                    </span>
                  </span>
                  {!item.read && (
                    <span className="tenant-announcement-new">New</span>
                  )}
                </button>
              </article>
            ))
          )}
        </div>
      </TenantPanel>

      {selectedAnnouncement && (
        <div
          className="tenant-announcement-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget)
              setSelectedAnnouncement(null);
          }}
        >
          <section
            className="tenant-announcement-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-modal-title"
          >
            <header className="tenant-announcement-modal-header">
              <div>
                <span className="tenant-announcement-modal-eyebrow">
                  ANNOUNCEMENT
                </span>
                <h2 id="announcement-modal-title">
                  {selectedAnnouncement.title}
                </h2>
                <time dateTime={selectedAnnouncement.publishedAt}>
                  {formatDate(selectedAnnouncement.publishedAt)}
                </time>
              </div>
              <button
                type="button"
                className="tenant-announcement-modal-close"
                aria-label="Close announcement"
                onClick={() => setSelectedAnnouncement(null)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>
            <p className="tenant-announcement-modal-text">
              {selectedAnnouncement.content}
            </p>
          </section>
        </div>
      )}
    </>
  );
}

export function TenantHelpCard() {
  return (
    <section className="tenant-help">
      <span className="tenant-help-icon">
        <FontAwesomeIcon icon={faHouse} />
      </span>
      <div>
        <strong>Need help?</strong>
        <p>
          If you have any concerns, please contact your landlord or property
          manager.
        </p>
      </div>
    </section>
  );
}
