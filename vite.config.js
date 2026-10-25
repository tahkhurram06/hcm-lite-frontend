import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If you'd rather not set VITE_API_URL, uncomment the proxy below and point
// api/client.js's BASE_URL at "/api" instead of a full URL — same effect,
// avoids CORS entirely during local dev.
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://localhost:5000",
  //       changeOrigin: true,
  //     },
  //   },
  // },
});