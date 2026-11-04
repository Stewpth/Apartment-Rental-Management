import DefaultProfileImg1 from "../../assets/images/default-profile/profile-default-img1.jpg";
import { useAuth } from "../../hooks/useAuth";

import "./ProfileCardHeader.css";
import "./ProfileCard.css";

export default function ProfileCardHeader() {
  const { user } = useAuth();
  return (
    <div className="profile-card-header">
      <img
        src={user?.profile?.profileImageUrl || DefaultProfileImg1}
        alt={
          user?.profile?.fullName
            ? `${user.profile.fullName} profile`
            : "Profile"
        }
        className="profile-card-user-img-header"
      />
      <div className="profile-card-details">
        <span className="profile-card-name-header admin">
          {user?.profile?.fullName || user?.username || "Account"}
        </span>
        <span className="profile-card-role-header tenant">
          {user?.role === "TENANT" ? "Tenant" : "Admin"}
        </span>
      </div>
    </div>
  );
}
