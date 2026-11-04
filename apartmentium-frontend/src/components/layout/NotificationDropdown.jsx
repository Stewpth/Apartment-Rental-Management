import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faChevronRight,
  faClipboardList,
  faCreditCard,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../api/axios";

const typeIcons = {
  ANNOUNCEMENT: faBullhorn,
  REQUEST: faClipboardList,
  REQUEST_UPDATE: faClipboardList,
  PAYMENT: faCreditCard,
};

function formatNotificationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/notifications");
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60_000);
    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function openNotification(notification) {
    if (!notification.readAt) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      try {
        await api.patch(`/auth/notifications/${notification.id}/read`);
      } catch {
        loadNotifications();
      }
    }
    setIsOpen(false);
    if (notification.link) navigate(notification.link);
  }

  async function markAllRead() {
    if (!unreadCount) return;
    setNotifications((current) =>
      current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })),
    );
    setUnreadCount(0);
    try {
      await api.patch("/auth/notifications/read-all");
    } catch {
      loadNotifications();
    }
  }

  return (
    <div className="notification-menu" ref={menuRef}>
      <button
        type="button"
        className="show-notification-button"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={isOpen}
        aria-controls="notification-dropdown"
        title="Notifications"
        onClick={() => {
          setIsOpen((open) => !open);
          if (!isOpen) loadNotifications();
        }}
      >
        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <FontAwesomeIcon icon={faBell} />
      </button>

      {isOpen && (
        <section
          className="notification-dropdown"
          id="notification-dropdown"
          aria-label="Notifications"
        >
          <header className="notification-dropdown-header">
            <div>
              <h2>Notifications</h2>
              <p>{unreadCount ? `${unreadCount} unread` : "You're all caught up"}</p>
            </div>
            <button
              type="button"
              className="notification-mark-all"
              disabled={!unreadCount || loading}
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </header>

          <div className="notification-dropdown-list" aria-live="polite">
            {loading ? (
              <div className="notification-dropdown-state">
                <span className="notification-spinner" aria-hidden="true" />
                <span>Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="notification-dropdown-state notification-error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={loadNotifications}>Try again</button>
              </div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item${notification.readAt ? " is-read" : " is-unread"}`}
                  onClick={() => openNotification(notification)}
                >
                  <span className={`notification-item-icon ${notification.type.toLowerCase()}`}>
                    <FontAwesomeIcon icon={typeIcons[notification.type] || faBell} />
                  </span>
                  <span className="notification-item-copy">
                    <span className="notification-item-title">{notification.title}</span>
                    <span className="notification-item-message">{notification.message}</span>
                    <time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
                  </span>
                  {!notification.readAt && <span className="notification-unread-dot" aria-label="Unread" />}
                  <FontAwesomeIcon className="notification-item-chevron" icon={faChevronRight} />
                </button>
              ))
            ) : (
              <div className="notification-empty-state">
                <span><FontAwesomeIcon icon={faBell} /></span>
                <strong>No notifications yet</strong>
                <p>Updates about announcements, requests, and payments will appear here.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
