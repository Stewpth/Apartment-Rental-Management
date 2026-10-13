import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import DefaultProfileImg1 from "../../assets/images/default-profile/profile-default-img1.jpg";

import "./ProfileCard.css";

export default function ProfileCard({ isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div
      className={`profile-card-container ${
        isSidebarOpen ? "expanded" : "collapsed"
      }`}
    >
      <div className="profile-card-left">
        <button
          type="button"
          className="profile-card-image-button"
          onClick={() => {
            if (!isSidebarOpen) {
              setIsSidebarOpen(true);
            }
          }}
          aria-label="Expand sidebar"
          title={isSidebarOpen ? "Profile picture" : "Expand sidebar"}
        >
          <img
            src={DefaultProfileImg1}
            alt="Default Profile"
            className="profile-card-user-img"
          />
        </button>

        <div className="profile-card-details">
          <span className="profile-card-name">John Doe</span>
          <span className="profile-card-role admin">Admin</span>
        </div>
      </div>

      <div className="profile-card-actions">
        <button
          type="button"
          className="logout-button"
          aria-label="Log out"
          title="Log out"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="logout-button-icon"
          />
        </button>
      </div>
    </div>
  );
}
