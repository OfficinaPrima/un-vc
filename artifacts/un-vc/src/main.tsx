import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import { API_BASE } from "./config";
import "./index.css";

// Point every API client call at the Render backend (frontend is hosted separately).
setBaseUrl(API_BASE);

createRoot(document.getElementById("root")!).render(<App />);
