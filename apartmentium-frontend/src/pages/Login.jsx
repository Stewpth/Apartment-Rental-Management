import BackgroundLogin from "./Login/BackgroundLogin";
import LoginForm from "./Login/LoginForm";

import "./Login.css";

export default function Login() {
  return (
    <main className="login-container">
      <BackgroundLogin />
      <LoginForm />
    </main>
  );
}
