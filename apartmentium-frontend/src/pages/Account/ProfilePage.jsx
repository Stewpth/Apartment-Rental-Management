import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import LoadingState from "../../components/ui/LoadingState";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import "./AccountPages.css";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const EMPTY_PROFILE = {
  fullName: "",
  username: "",
  email: "",
  contact: "",
  picture: "",
};

function profileFromUser(user) {
  return {
    fullName: user.profile?.fullName || user.username || "",
    username: user.username || "",
    email: user.email || "",
    contact: user.profile?.phone || "",
    picture: user.profile?.profileImageUrl || "",
  };
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(
        new Error("Unable to read this image. Please choose another file."),
      );
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const role = user?.role === "TENANT" ? "Tenant" : "Admin";
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pictureError, setPictureError] = useState("");
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreviewUrl, setPicturePreviewUrl] = useState("");

  useEffect(() => {
    if (!picturePreviewUrl) return undefined;
    return () => URL.revokeObjectURL(picturePreviewUrl);
  }, [picturePreviewUrl]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/me");
      const nextProfile = profileFromUser(data.user);
      updateUser(data.user);
      setProfile(nextProfile);
      setDraft(nextProfile);
      setError("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setError("");
  }

  function startEditing() {
    setDraft(profile);
    setPictureFile(null);
    setPicturePreviewUrl("");
    setSaved(false);
    setError("");
    setPictureError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setPictureFile(null);
    setPicturePreviewUrl("");
    setIsEditing(false);
    setSaved(false);
    setError("");
    setPictureError("");
  }

  function handlePictureChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setPictureError("Choose a PNG, JPEG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setPictureError("Profile pictures must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setPictureFile(file);
    setPicturePreviewUrl(URL.createObjectURL(file));
    setSaved(false);
    setPictureError("");
    setError("");
    event.target.value = "";
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Keep the selected file local until Save Changes is submitted.
      const payload = {
        fullName: draft.fullName,
        username: draft.username,
        email: draft.email,
        phone: draft.contact,
      };
      if (pictureFile) payload.profileImage = await readImageFile(pictureFile);
      const { data } = await api.patch("/auth/me/profile", payload);
      const nextProfile = profileFromUser(data.user);
      updateUser(data.user);
      setProfile(nextProfile);
      setDraft(nextProfile);
      setPictureFile(null);
      setPicturePreviewUrl("");
      setIsEditing(false);
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save profile changes.",
      );
    } finally {
      setSaving(false);
    }
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
              {loading ? (
                <LoadingState variant="compact" message="Loading profile…" />
              ) : error && !isEditing ? (
                <>
                  <p className="account-form-error" role="alert">
                    {error}
                  </p>
                  <button
                    type="button"
                    className="account-secondary-button"
                    onClick={loadProfile}
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <div className="profile-identity">
                    <span className="profile-avatar">
                      {picturePreviewUrl || draft.picture ? (
                        <img
                          src={picturePreviewUrl || draft.picture}
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
                          {picturePreviewUrl || draft.picture
                            ? "Change Profile Picture"
                            : "Add Profile Picture"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handlePictureChange}
                          />
                        </label>
                      )}
                      {isEditing && (
                        <small className="profile-picture-help">
                          Preview only. The photo is saved when you click Save
                          Changes.
                        </small>
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
                  {error && isEditing && (
                    <p className="account-form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <form className="profile-form" onSubmit={saveProfile}>
                    <label>
                      Full Name
                      <input
                        required
                        maxLength={120}
                        disabled={!isEditing || saving}
                        value={draft.fullName}
                        onChange={(event) =>
                          updateField("fullName", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Username
                      <input
                        required
                        maxLength={120}
                        disabled={!isEditing || saving}
                        value={draft.username}
                        onChange={(event) =>
                          updateField("username", event.target.value)
                        }
                      />
                    </label>
                    <label>
                      Email Address
                      <input
                        required
                        maxLength={254}
                        disabled={!isEditing || saving}
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
                        maxLength={30}
                        disabled={!isEditing || saving}
                        type="tel"
                        value={draft.contact}
                        onChange={(event) =>
                          updateField("contact", event.target.value)
                        }
                      />
                    </label>
                    <footer>
                      {saved && !isEditing && (
                        <span className="account-form-success" role="status">
                          Profile changes saved.
                        </span>
                      )}
                      {isEditing ? (
                        <>
                          <button
                            className="account-secondary-button"
                            type="button"
                            disabled={saving}
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                          <button
                            className="account-primary-button"
                            type="submit"
                            disabled={saving}
                          >
                            {saving ? "Saving..." : "Save Changes"}
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
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
