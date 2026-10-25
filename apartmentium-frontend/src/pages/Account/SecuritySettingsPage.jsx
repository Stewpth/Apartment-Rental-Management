import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import "./AccountPages.css";

const initialPasswords = { current: "", next: "", confirm: "" };

export default function SecuritySettingsPage() {
  const [passwords, setPasswords] = useState(initialPasswords);
  const [visibleFields, setVisibleFields] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updatePassword(field, value) {
    setPasswords((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  }

  function submitPassword(event) {
    event.preventDefault();
    if (passwords.next.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setError("The new password and confirmation do not match.");
      return;
    }
    setPasswords(initialPasswords);
    setMessage(
      "Password form validated. Connect account security to save this change.",
    );
  }

  const fields = [
    {
      key: "current",
      label: "Current Password",
      placeholder: "Enter current password",
      autocomplete: "current-password",
    },
    {
      key: "next",
      label: "New Password",
      placeholder: "Enter new password",
      autocomplete: "new-password",
    },
    {
      key: "confirm",
      label: "Confirm New Password",
      placeholder: "Enter confirm password",
      autocomplete: "new-password",
    },
  ];

  return (
    <>
      <title>Settings</title>
      <div className="page-container">
        <Sidebar />
        <main className="page-main">
          <Header />
          <div className="page-content account-page">
            <section className="account-card security-card-page">
              <header className="account-page-heading">
                <h1>Settings</h1>
                <p>Manage your account security.</p>
              </header>
              <div className="security-feature">
                <FontAwesomeIcon icon={faShieldHalved} />
                <div>
                  <strong>Change Password</strong>
                  <p>Update your password to keep your account secure.</p>
                </div>
              </div>
              <form className="security-form" onSubmit={submitPassword}>
                {fields.map((field) => (
                  <label className="security-field" key={field.key}>
                    <span>{field.label}</span>
                    <span className="security-input-wrap">
                      <input
                        required
                        minLength={field.key === "current" ? undefined : 8}
                        autoComplete={field.autocomplete}
                        type={visibleFields[field.key] ? "text" : "password"}
                        placeholder={field.placeholder}
                        value={passwords[field.key]}
                        onChange={(event) =>
                          updatePassword(field.key, event.target.value)
                        }
                      />
                      <button
                        type="button"
                        aria-label={
                          visibleFields[field.key]
                            ? `Hide ${field.label.toLowerCase()}`
                            : `Show ${field.label.toLowerCase()}`
                        }
                        onClick={() =>
                          setVisibleFields((current) => ({
                            ...current,
                            [field.key]: !current[field.key],
                          }))
                        }
                      >
                        <FontAwesomeIcon
                          icon={visibleFields[field.key] ? faEyeSlash : faEye}
                        />
                      </button>
                    </span>
                  </label>
                ))}
                {error && (
                  <p className="account-form-error" role="alert">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="account-form-success" role="status">
                    {message}
                  </p>
                )}
                <footer>
                  <button className="account-primary-button" type="submit">
                    Update Password
                  </button>
                </footer>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
