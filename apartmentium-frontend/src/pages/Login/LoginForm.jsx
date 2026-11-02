import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  faEye,
  faEyeSlash,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import "./LoginForm.css";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const user = await login(
        formData.get("username"),
        formData.get("password"),
        formData.get("rememberMe") === "on",
      );
      const fallback =
        user.role === "TENANT" ? "/tenant/dashboard" : "/admin/dashboard";
      const requestedPath = location.state?.from?.pathname;
      const intendedPathMatchesRole = requestedPath?.startsWith(
        user.role === "TENANT" ? "/tenant/" : "/admin/",
      );
      navigate(intendedPathMatchesRole ? requestedPath : fallback, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="login-form-container">
      <div className="login-form">
        <div className="login-form-heading">
          <h2 className="login-form-title">Welcome Back!</h2>
          <p className="login-form-subtitle">
            Sign in to your Apartmentium account.
          </p>
        </div>

        <form className="login-form-inputs" onSubmit={handleSubmit}>
          <div className="login-form-input">
            <label className="login-form-label" htmlFor="username">
              Username or Email
            </label>

            <input
              className="login-form-input-field"
              type="text"
              name="username"
              id="username"
              placeholder="Enter your username or email"
              autoComplete="username"
              required
            />
          </div>

          <div className="login-form-input">
            <label className="login-form-label" htmlFor="password">
              Password
            </label>

            <div className="login-input-container">
              <input
                className="login-form-input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="login-form-options">
            <label className="remember-me">
              <input type="checkbox" name="rememberMe" />
              <span>Remember me</span>
            </label>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Signing in…" : "Login"}</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        <p className="login-form-footer">
          Need help accessing your account?
          <span> Contact your administrator.</span>
        </p>
      </div>
    </section>
  );
}
