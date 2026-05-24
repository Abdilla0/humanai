import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181F",
            color: "#F2F2FF",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

