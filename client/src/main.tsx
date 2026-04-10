import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

if (rootEl.innerHTML.trim()) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
