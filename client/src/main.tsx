import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root")!;

// Always use createRoot. When SSR content is present the browser already
// painted the pre-rendered HTML (good for SEO and first paint). React
// replaces it cleanly without hydration mismatch warnings.
// NOTE: BrowserRouter is mounted inside App so the Practice Mode overlay
// (which uses its own MemoryRouter) can sit as a sibling — React Router v6
// forbids nesting one Router inside another.
createRoot(rootEl).render(<App />);
