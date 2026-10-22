import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CaseStudyPage from "./CaseStudyPage";
import { portafolio, portafolioTitles } from "./content/portafolio";
import "@fontsource-variable/archivo/wdth.css";
import "./styles/index.css";
import "./styles/case-study.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CaseStudyPage name="Portafolio HGS" copy={portafolio} titles={portafolioTitles} />
  </StrictMode>,
);
