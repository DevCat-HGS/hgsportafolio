import type { MzIconName } from "../content/migozz";

/** 24 × 24 line icons for the MIGOZZ case study. Stroke follows currentColor. */
const PATHS: Record<MzIconName, string> = {
  download: "M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  devices: "M3 5h13v10H3zM1 19h17M17 9h4a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z",
  link: "M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2",
  languages: "M4 5h9M8.5 3v2m3 0c-1 4-3.5 7-7.5 9m3-5c1.2 2.2 3 4 5.5 5M13 21l4-9 4 9m-6.8-3h5.6",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4m8-4v4M8 14h2m4 0h2m-8 3h2",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  users:
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1m0-18a4 4 0 0 1 0 8m6 10v-1a6 6 0 0 0-4-5.6",
  gift: "M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-1.5-3.5-6-3.5-6-1s4 1 6 1Zm0 0c1.5-3.5 6-3.5 6-1s-4 1-6 1Z",
  cards: "M8 4h11a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM4 7v12a2 2 0 0 0 2 2h9",
  chat: "M4 5h16v11H9l-5 4V5Zm4 5h.01M12 10h.01M16 10h.01",
  badge:
    "m12 2 2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2ZM8.5 12l2.5 2.5 4.5-5",
  cash: "M2 7h20v10H2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 10v4m12-4v4",
};

export function MzIcon({ name, size = 24 }: { name: MzIconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
