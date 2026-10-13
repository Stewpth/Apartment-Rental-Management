import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

import LoginBackgroundImg from "../../assets/images/backgrounds/login-background.jpg";
import "./BackgroundLogin.css";

export default function BackgroundLogin() {
  return (
    <section className="login-background">
      <img
        className="login-background-img"
        src={LoginBackgroundImg}
        alt="login background image"
      />

      <div className="login-background-darker" />

      <div className="login-content-box">
        <div className="login-brand">
          <FontAwesomeIcon icon={faHouse} className="login-logo" />
          <h1 className="login-system-name">Apartmentium</h1>
          <p className="login-description">Manage your apartments with ease.</p>
        </div>

        <div className="login-brand-footer">
          <span>Simple living. Smarter management.</span>
        </div>
      </div>
    </section>
  );
}
