import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Always use createRoot. When SSR content is present the browser already
// painted the pre-rendered HTML (good for SEO and first paint). React
// replaces it cleanly without hydration mismatch warnings.
createRoot(rootEl).render(app);
