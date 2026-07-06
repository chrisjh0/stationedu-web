import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// In production the frontend is served from Vercel while the API lives on
// Railway. VITE_API_URL lets the build know where to direct API calls.
// In dev the Vite proxy handles /api/* so no base URL is needed.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) setBaseUrl(apiUrl);

if (import.meta.env.DEV) {
  console.log("[ClubHub] API base URL:", apiUrl ?? "(none — using Vite proxy)");
}

createRoot(document.getElementById("root")!).render(<App />);
