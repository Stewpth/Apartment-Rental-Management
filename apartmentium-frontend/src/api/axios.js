const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(method, path, body) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  const isLoginRequest = path === "/auth/login";

  if (response.status === 401 && !isLoginRequest) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.response = { status: response.status, data };
    throw error;
  }

  return { data, status: response.status };
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
};

export default api;
