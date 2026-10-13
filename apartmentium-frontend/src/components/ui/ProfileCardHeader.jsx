import DefaultProfileImg1 from "../../assets/images/default-profile/profile-default-img1.jpg";

import "./ProfileCardHeader.css";
import "./ProfileCard.css";

export default function ProfileCardHeader() {
  return (
    <div className="profile-card-header">
      <img src={DefaultProfileImg1} className="profile-card-user-img-header" />
      <div className="profile-card-details">
        <span className="profile-card-name-header admin">John Doe</span>
        <span className="profile-card-role-header tenant">Admin</span>
      </div>
    </div>
  );
}
