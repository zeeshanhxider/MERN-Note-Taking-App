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
            background: "#1E1E1E", 
            color: "#f9fafb", 
          },
          success: {
            style: {
              background: "#1E1E1E", 
              color: "#f9fafb", 
            },
          },
          error: {
            style: {
              background: "#1E1E1E", 
              color: "#f9fafb", 
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
