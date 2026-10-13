import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import DefaultProfileImg1 from "../../assets/images/default-profile/profile-default-img1.jpg";

import "./ProfileCard.css";

export default function ProfileCard() {
  return (
    <div className="profile-card-container">
      <div className="profile-card-left">
        <img
          src={DefaultProfileImg1}
          alt="Default Profile"
          className="profile-card-user-img"
        />
        <div className="profile-card-details">
          <span className="profile-card-name">John Doe</span>
          <span className="profile-card-role admin">Admin</span>
        </div>
      </div>

      <div className="profile-card-actions">
        <button className="logout-button">
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="logout-button-icon"
          />
        </button>
      </div>
    </div>
  );
}
