import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CaseStudyPage from "./CaseStudyPage";
import { aria, ariaTitles } from "./content/aria";
import "@fontsource-variable/archivo/wdth.css";
import "./styles/index.css";
import "./styles/case-study.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CaseStudyPage name="ARIA" copy={aria} titles={ariaTitles} />
  </StrictMode>,
);
