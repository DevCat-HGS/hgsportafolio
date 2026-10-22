import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MigozzPage from "./MigozzPage";
import "@fontsource-variable/archivo/wdth.css";
import "./styles/index.css";
import "./styles/migozz.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MigozzPage />
  </StrictMode>,
);
