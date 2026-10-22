import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CaseStudyPage from "./CaseStudyPage";
import { devpanel, devpanelTitles } from "./content/devpanel";
import "@fontsource-variable/archivo/wdth.css";
import "./styles/index.css";
import "./styles/case-study.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CaseStudyPage name="DevPanel" copy={devpanel} titles={devpanelTitles} />
  </StrictMode>,
);
