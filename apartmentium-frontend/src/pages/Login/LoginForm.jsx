import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import "./LoginForm.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="login-form-container">
      <div className="login-form">
        <div className="login-form-heading">
          <h2 className="login-form-title">Welcome Back!</h2>
          <p className="login-form-subtitle">
            Sign in to your Apartmentium account.
          </p>
        </div>

        <form
          className="login-form-inputs"
          onSubmit={(event) => event.preventDefault()}
        >
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

          <button className="login-button" type="submit">
            <span>Login</span>
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
