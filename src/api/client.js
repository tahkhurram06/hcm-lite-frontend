import axios from "axios";

// If you're using the Vite proxy (see vite.config.js's commented-out
// section), set this to "/api" instead and drop VITE_API_URL entirely.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: BASE_URL,
});

// Attach the JWT on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A 401 means the token is invalid/expired — clear it and bounce to login.
// We do a hard redirect (not useNavigate) because this runs outside React.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default client;