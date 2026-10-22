import { lazy, Suspense, useState } from "react";
import { copy, type CredItem } from "./content";
import { Close } from "./components/Close";
import { Credentials } from "./components/Credentials";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Practice } from "./components/Practice";
import { Projects } from "./components/Projects";
import { Stack } from "./components/Stack";
import { Startup } from "./components/Startup";
import { Tenure } from "./components/Tenure";
import { useActiveSection } from "./hooks/useActiveSection";
import { useLocale } from "./hooks/useLocale";
import { useReveal } from "./hooks/useReveal";
import { useScrollScene } from "./hooks/useScrollScene";
import { useSpotlight } from "./hooks/useSpotlight";
import { useSplash } from "./hooks/useSplash";

// Only needed once someone opens a certificate, so it stays out of the first bundle.
const Lightbox = lazy(() => import("./components/Lightbox").then((m) => ({ default: m.Lightbox })));

export default function App() {
  const { locale, toggle } = useLocale();
  const t = copy[locale];
  const [open, setOpen] = useState<CredItem | null>(null);
  const active = useActiveSection();

  useScrollScene();
  useReveal();
  useSpotlight();
  useSplash();

  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <Nav t={t} locale={locale} active={active} onToggleLocale={toggle} />

      <main id="main">
        <Hero t={t} />
        <Practice t={t} />
        <Startup t={t} />
        <Tenure t={t} />
        <Projects t={t} />
        <Credentials t={t} onOpen={setOpen} />
        <Stack t={t} />
        <Close t={t} />
      </main>

      {open ? (
        <Suspense fallback={null}>
          <Lightbox item={open} close={() => setOpen(null)} label={t.credClose} />
        </Suspense>
      ) : null}

      <footer className="footer">
        <div className="wrap">{t.footer}</div>
      </footer>
    </>
  );
}
