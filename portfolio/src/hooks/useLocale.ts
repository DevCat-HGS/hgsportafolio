import { useCallback, useEffect, useState } from "react";
import type { Locale } from "../content";

const TITLES: Record<Locale, string> = {
  es: "Harol Guerrero Salgado — Desarrollador Full Stack | Medellín",
  en: "Harol Guerrero Salgado — Full Stack Developer | Medellín",
};

/** The URL decides the language: /en/ is English, everything else Spanish. The static HTML and splash.js use the same rule. */
export const localeFromPath = (pathname: string): Locale => (/^\/en(\/|$)/.test(pathname) ? "en" : "es");

/** The same page in the other language: / and /en/, /migozz/ and /en/migozz/. */
export const switchLocalePath = (pathname: string, next: Locale) => {
  const rest = pathname.replace(/^\/en(\/|$)/, "/");
  return next === "en" ? `/en${rest}` : rest;
};

/**
 * Netlify redirects first-time visitors with an English browser from / to /en/ and lets the nf_lang cookie win over
 * the browser language, so a manual choice sticks.
 */
function rememberChoice(locale: Locale) {
  try {
    document.cookie = `nf_lang=${locale}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* cookies unavailable */
  }
}

/** Current language, taken from the URL, mirrored on <html lang> and the title, and switched without reloading. */
export function useLocale(titles: Record<Locale, string> = TITLES) {
  const [locale, setLocale] = useState<Locale>(() => localeFromPath(location.pathname));

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = titles[locale];
  }, [locale, titles]);

  // Back and forward between /en/ and / change the language too.
  useEffect(() => {
    const onPop = () => setLocale(localeFromPath(location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const toggle = useCallback(() => {
    const next: Locale = locale === "en" ? "es" : "en";
    history.pushState(null, "", switchLocalePath(location.pathname, next) + location.hash);
    rememberChoice(next);
    setLocale(next);
  }, [locale]);

  return { locale, toggle };
}
