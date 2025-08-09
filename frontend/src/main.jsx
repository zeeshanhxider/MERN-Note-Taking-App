import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        toastOptions={{
          style: {
            background: "#1f2937", // Dark gray background
            color: "#f9fafb", // Light text
          },
          success: {
            style: {
              background: "#065f46", // Dark green for success
              color: "#ecfdf5", // Light green text
            },
          },
          error: {
            style: {
              background: "#7f1d1d", // Dark red for errors
              color: "#fef2f2", // Light red text
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
