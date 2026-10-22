import data from "./data/migozz-public.json";

/**
 * Public MIGOZZ figures for the charts on /migozz/, each with where it was read. Checked on 10 Oct 2026.
 *
 * - releases: the App Store version history (apps.apple.com/co/app/migozz/id6502121020 → "Historial de versiones").
 *   The store lists the 25 most recent versions; older ones are not shown there.
 * - creators: the community totals shown on the featured creator profiles of migozz.com.
 */
export const IOS_RELEASES: readonly { version: string; date: string }[] = data.releases;

/** Community shown on each featured profile of migozz.com (followers summed across the creator's networks). */
export const FEATURED_CREATORS: readonly { name: string; community: number }[] = data.creators;
