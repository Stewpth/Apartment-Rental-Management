import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import ProfileCardHeader from "../ui/ProfileCardHeader";
import NotificationDropdown from "./NotificationDropdown";
import "./Header.css";
import "./NotificationDropdown.css";

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
        <NotificationDropdown />

        <div className="header-profile-card">
          <ProfileCardHeader />
        </div>
      </section>
    </header>
  );
}
