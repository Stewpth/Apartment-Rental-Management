import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthContext from "./auth-context";

function clearStoredSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(
    (shouldNavigate = true) => {
      clearStoredSession();
      setUser(null);
      if (shouldNavigate) navigate("/login", { replace: true });
    },
    [navigate],
  );

  useEffect(() => {
    let active = true;
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return undefined;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;
        storage.setItem("user", JSON.stringify(data.user));
      })
      .catch(() => {
        if (active) logout(false);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [logout]);

  useEffect(() => {
    const onUnauthorized = () => logout(false);
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [logout]);

  const login = useCallback(async (identifier, password, rememberMe) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem("token");
    otherStorage.removeItem("user");
    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

