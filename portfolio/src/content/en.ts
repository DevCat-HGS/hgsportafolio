import site from "./data/site.json";
import { checked } from "./json";
import { projectsFor } from "./projects";
import type { Copy } from "./types";

/** Texts of the English site, edited in data/site.json (admin: Textos del sitio). Projects come from data/projects.json. */
export const en: Copy = { ...checked<Omit<Copy, "projects">>(site.en), projects: projectsFor("en") };
