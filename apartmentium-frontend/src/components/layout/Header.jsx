import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import ProfileCardHeader from "../ui/ProfileCardHeader";
import "./Header.css";

export default function Header() {
  return (
    <header className="header-container">
      <section className="header-left-side">
        <div className="search-bar-container">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="search-bar-icon"
          />

          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search dashboard"
          />
        </div>
      </section>

      <section className="header-right-side">
        <button
          type="button"
          className="show-notification-button"
          aria-label="Notifications, 3 unread"
          title="Notifications"
        >
          <span className="notification-count">3</span>

          <FontAwesomeIcon icon={faBell} />
        </button>

        <div className="header-profile-card">
          <ProfileCardHeader />
        </div>
      </section>
    </header>
  );
}
