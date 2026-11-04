import { useCallback, useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faPenToSquare,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import CreateAnnouncement from "./CreateAnnouncement";
import api from "../../api/axios";

import "./Announcements.css";

export default function Announcements() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/announcements");
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

  async function publishAnnouncement({ title, content }) {
    try {
      await api.post("/admin/announcements", { title, content });
      await loadAnnouncements();
      setIsCreating(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to publish announcement.",
      );
      throw requestError;
    }
  }

  async function saveAnnouncement({ title, content }) {
    try {
      await api.patch(`/admin/announcements/${editingAnnouncement.id}`, {
        title,
        content,
      });
      await loadAnnouncements();
      setEditingAnnouncement(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update announcement.",
      );
      throw requestError;
    }
  }

  return (
    <>
      <title>Announcements</title>

      <div className="page-container">
        <Sidebar />

        <main className="page-main">
          <Header />

          <div className="page-content">
            <div className="announcements-container">
              <div className="announcements-contents">
                <div className="announcements-heading">
                  <div>
                    <h1>Announcements</h1>
                    <p>View and manage announcements for your community</p>
                  </div>
                  <button
                    type="button"
                    className="announcement-create-button"
                    onClick={() => setIsCreating(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>New Announcement</span>
                  </button>
                </div>

                {error && (
                  <p className="announcement-error" role="alert">
                    {error}
                  </p>
                )}
                {loading ? (
                  <p className="announcement-loading" role="status">
                    Loading announcements…
                  </p>
                ) : announcements.length === 0 ? (
                  <section
                    className="announcements-empty-state"
                    aria-live="polite"
                  >
                    <FontAwesomeIcon
                      className="announcements-empty-icon"
                      icon={faBullhorn}
                    />
                    <h2>No announcements yet</h2>
                    <p>Announcements will appear here when posted</p>
                  </section>
                ) : (
                  <section
                    className="announcement-list"
                    aria-label="Published announcements"
                  >
                    {announcements.map((announcement) => (
                      <article
                        className="announcement-card"
                        key={announcement.id}
                      >
                        <div className="announcement-card-heading">
                          <div className="announcement-card-title">
                            <h2>{announcement.title}</h2>
                            <time dateTime={announcement.publishedAt}>
                              {new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                              }).format(new Date(announcement.publishedAt))}
                            </time>
                          </div>
                          <button
                            type="button"
                            className="announcement-edit-button"
                            onClick={() => setEditingAnnouncement(announcement)}
                            aria-label={`Edit announcement: ${announcement.title}`}
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                            <span>Edit Announcement</span>
                          </button>
                        </div>
                        <p>{announcement.content}</p>
                      </article>
                    ))}
                  </section>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      {(isCreating || editingAnnouncement) && (
        <CreateAnnouncement
          announcement={editingAnnouncement}
          onClose={() => {
            setIsCreating(false);
            setEditingAnnouncement(null);
          }}
          onPublish={editingAnnouncement ? saveAnnouncement : publishAnnouncement}
        />
      )}
    </>
  );
}
