import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faHouse,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import TenantPanel from "./TenantPanel";
import "./DashboardAnnouncements.css";

const announcements = [
  {
    title: "Scheduled water interruption",
    date: "October 22, 2026",
    text: "Water supply maintenance will take place on October 25, from 8:00 AM to 12:00 PM.",
  },
  {
    title: "Monthly building inspection",
    date: "October 20, 2026",
    text: "Please keep your unit accessible during the scheduled inspection.",
  },
  {
    title: "Reminder: Rental payment",
    date: "October 18, 2026",
    text: "Please review your outstanding balance and upcoming due date.",
  },
];

export function LatestAnnouncements() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    if (!selectedAnnouncement) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedAnnouncement(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedAnnouncement]);

  return (
    <>
      <TenantPanel
        title="Latest announcements"
        icon={faBullhorn}
        className="announcement-panel"
      >
        <div className="tenant-announcements">
          {announcements.map((item) => (
            <article
              key={item.title}
              className="tenant-announcement"
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              onClick={() => setSelectedAnnouncement(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedAnnouncement(item);
                }
              }}
            >
              <div>
                <strong>{item.title}</strong>
                <time>{item.date}</time>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </TenantPanel>

      {selectedAnnouncement && (
        <div
          className="tenant-announcement-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAnnouncement(null);
            }
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

                <time>{selectedAnnouncement.date}</time>
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
              {selectedAnnouncement.text}
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
