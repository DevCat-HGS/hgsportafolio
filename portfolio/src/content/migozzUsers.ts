import users from "./data/migozz-users.json";
import { checked } from "./json";

/**
 * Real MIGOZZ user figures for the charts on /migozz/. The section stays hidden while `visible` is false, so the page
 * never shows invented numbers. Fill it from Firebase Analytics, Google Play Console or App Store Connect, set
 * `asOf` and `source`, turn `visible` on, and the charts appear on the next deploy.
 *
 * Example:
 *   export const USER_DATA: UserData = {
 *     asOf: "2026-10-10",
 *     source: { es: "Firebase Analytics", en: "Firebase Analytics" },
 *     metric: { es: "Usuarios activos por mes", en: "Monthly active users" },
 *     monthly: [{ month: "2026-02", users: 120 }, { month: "2026-03", users: 340 }],
 *     platforms: [{ name: "Android", users: 600 }, { name: "iOS", users: 300 }, { name: "Web", users: 100 }],
 *     countries: [{ name: { es: "Colombia", en: "Colombia" }, users: 500 }],
 *   };
 */
export type Platform = "Android" | "iOS" | "Web";

export interface UserData {
  /** Date the figures were taken, ISO (YYYY-MM-DD). */
  asOf: string;
  source: { es: string; en: string };
  /** What `monthly` counts: active users, sign-ups, installs… */
  metric: { es: string; en: string };
  /** One point per month, oldest first. `month` is YYYY-MM. */
  monthly: readonly { month: string; users: number }[];
  /** Users per platform, any order. Empty to hide the chart. */
  platforms: readonly { name: Platform; users: number }[];
  /** Top countries by users. Empty to hide the chart. */
  countries: readonly { name: { es: string; en: string }; users: number }[];
}

/** Edited in data/migozz-users.json (admin: MIGOZZ → Usuarios). `visible: false` keeps the section hidden. */
export const USER_DATA: UserData | null = users.visible ? checked<UserData>(users) : null;
