import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <ThemeProvider> */}
    <div className="p-0 m-0">
      <App />
    </div>
    {/* </ThemeProvider> */}
  </StrictMode>
);
