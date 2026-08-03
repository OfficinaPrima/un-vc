import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import { API_BASE } from "./config";
import { supabase } from "./lib/supabase";
import "./index.css";

// Point every API client call at the Render backend (frontend is hosted separately).
setBaseUrl(API_BASE);

// Attach the logged-in user's token to API calls so the backend knows who's acting.
setAuthTokenGetter(async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
});

createRoot(document.getElementById("root")!).render(<App />);
