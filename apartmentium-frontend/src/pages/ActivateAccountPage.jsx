import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./ActivateAccountPage.css";

export default function ActivateAccountPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [activated, setActivated] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/activate/verify", { email, otp });
      setActivated(true);
      setMessage(data.message || "Your account is activated. You can now sign in.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to activate your account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    setIsResending(true);
    try {
      const { data } = await api.post("/auth/activate/resend", { email });
      setMessage(data.message || "A new OTP has been sent if your account needs activation.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to resend the OTP.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="activate-account-page">
      <section className="activate-account-card">
        <p className="activate-account-eyebrow">APARTMENTIUM</p>
        <h1>Activate your account</h1>
        <p className="activate-account-description">
          Enter the email address used for your rental and the 6-digit OTP we sent you.
        </p>

        <form onSubmit={handleVerify}>
          <label htmlFor="activation-email">Email address</label>
          <input
            id="activation-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={activated}
          />

          <label htmlFor="activation-otp">Activation OTP</label>
          <input
            id="activation-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="000000"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            disabled={activated}
          />

          {error && <p className="activate-account-error" role="alert">{error}</p>}
          {message && <p className="activate-account-message" role="status">{message}</p>}

          {!activated && (
            <>
              <button type="submit" disabled={isSubmitting || otp.length !== 6}>
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                className="activate-account-resend"
                type="button"
                onClick={handleResend}
                disabled={isResending || !email.trim()}
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            </>
          )}
        </form>

        <Link className="activate-account-login-link" to="/login">
          {activated ? "Continue to sign in" : "Back to sign in"}
        </Link>
      </section>
    </main>
  );
}
