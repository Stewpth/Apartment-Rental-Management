import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import "./AccountPages.css";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ProfilePage() {
  const location = useLocation();
  const isTenant = location.pathname.startsWith("/tenant/");
  const role = isTenant ? "Tenant" : "Admin";
  const [profile, setProfile] = useState({
    fullName: isTenant ? "Maria Santos" : "John Doe",
    email: isTenant ? "maria@example.com" : "john@example.com",
    contact: "09XX XXX XXXX",
    picture: "",
  });
  const [draft, setDraft] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pictureError, setPictureError] = useState("");

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function startEditing() {
    setDraft(profile);
    setSaved(false);
    setPictureError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setIsEditing(false);
    setSaved(false);
    setPictureError("");
  }

  function handlePictureChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPictureError("Pumili ng image file para sa profile picture.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setPictureError("Hanggang 5 MB lamang ang profile picture.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, picture: reader.result }));
      setSaved(false);
      setPictureError("");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function saveProfile(event) {
    event.preventDefault();
    setProfile(draft);
    setIsEditing(false);
    setSaved(true);
  }

  return (
    <>
      <title>My Profile</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content account-page">
            <section className="account-card profile-card-page">
              <header className="account-page-heading">
                <h1>My Profile</h1>
                <p>View and manage your personal information.</p>
              </header>
              <div className="profile-identity">
                <span className="profile-avatar">
                  {draft.picture ? (
                    <img
                      src={draft.picture}
                      alt={`${draft.fullName} profile`}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUser} />
                  )}
                </span>
                <div className="profile-identity-details">
                  <strong>{draft.fullName}</strong>
                  <span>{role}</span>
                  {isEditing && (
                    <label className="profile-picture-upload">
                      <FontAwesomeIcon icon={faCamera} />
                      {draft.picture
                        ? "Change Profile Picture"
                        : "Add Profile Picture"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                      />
                    </label>
                  )}
                </div>
              </div>
              {pictureError && (
                <p
                  className="account-form-error profile-picture-error"
                  role="alert"
                >
                  {pictureError}
                </p>
              )}
              <form className="profile-form" onSubmit={saveProfile}>
                <label>
                  Full Name
                  <input
                    required
                    disabled={!isEditing}
                    value={draft.fullName}
                    onChange={(event) =>
                      updateField("fullName", event.target.value)
                    }
                  />
                </label>
                <label>
                  Email Address
                  <input
                    required
                    disabled={!isEditing}
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                  />
                </label>
                <label>
                  Contact Number
                  <input
                    disabled={!isEditing}
                    type="tel"
                    value={draft.contact}
                    onChange={(event) =>
                      updateField("contact", event.target.value)
                    }
                  />
                </label>
                <div className="profile-role-field">
                  <span>Account Role</span>
                  <span className={`profile-page-role ${role.toLowerCase()}`}>
                    {role}
                  </span>
                  <small>Your role cannot be changed from this page.</small>
                </div>
                <footer>
                  {saved && !isEditing && (
                    <span className="account-form-success">
                      Profile changes saved for this preview.
                    </span>
                  )}
                  {isEditing ? (
                    <>
                      <button
                        className="account-secondary-button"
                        type="button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                      <button className="account-primary-button" type="submit">
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      className="account-primary-button"
                      type="button"
                      onClick={startEditing}
                    >
                      Change Information
                    </button>
                  )}
                </footer>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
