import type { ReactNode } from "react";

type EventLocalIconName =
  | "agency"
  | "alcohol"
  | "artist"
  | "basics"
  | "booth"
  | "calendar"
  | "check"
  | "city"
  | "contact"
  | "food"
  | "market"
  | "property"
  | "sound"
  | "tax"
  | "tent"
  | "timeline"
  | "traffic"
  | "truck"
  | "venue"
  | "verified"
  | "warning";

export function EventLocalIcon({
  name,
  className = "h-5 w-5"
}: {
  name: EventLocalIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}

export type { EventLocalIconName };

const iconPaths: Record<EventLocalIconName, ReactNode> = {
  agency: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V9l6-4 6 4v11" />
      <path d="M9 20v-5h6v5" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </>
  ),
  alcohol: (
    <>
      <path d="M8 4h8l-1 7a3 3 0 0 1-6 0L8 4Z" />
      <path d="M12 14v6" />
      <path d="M9 20h6" />
      <path d="M9 8h6" />
    </>
  ),
  artist: (
    <>
      <path d="M5 18c3-5 7-5 14-8" />
      <path d="M6 18c1.5 1.5 4 1.5 5.5 0" />
      <path d="M15 5l4 4" />
      <path d="M14 6l3-3 4 4-3 3" />
    </>
  ),
  basics: (
    <>
      <path d="M5 5h14v14H5z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M8 17h7" />
    </>
  ),
  booth: (
    <>
      <path d="M4 9h16l-2-4H6L4 9Z" />
      <path d="M6 9v10h12V9" />
      <path d="M9 19v-5h6v5" />
      <path d="M4 9c1 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0" />
    </>
  ),
  calendar: (
    <>
      <path d="M6 4v3M18 4v3" />
      <path d="M4 7h16v13H4z" />
      <path d="M4 11h16" />
      <path d="M8 15h3M14 15h2" />
    </>
  ),
  check: (
    <>
      <path d="M20 7 10 17l-5-5" />
      <path d="M4 4h16v16H4z" />
    </>
  ),
  city: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V8h5v12" />
      <path d="M13 20V5h5v15" />
      <path d="M8 11h1M8 14h1M15 9h1M15 12h1M15 15h1" />
    </>
  ),
  contact: (
    <>
      <path d="M5 6h14v12H5z" />
      <path d="m5 8 7 5 7-5" />
      <path d="M8 18v2h8v-2" />
    </>
  ),
  food: (
    <>
      <path d="M7 4v16" />
      <path d="M5 4v5a2 2 0 0 0 4 0V4" />
      <path d="M14 4v16" />
      <path d="M14 4c4 2 4 7 0 9" />
    </>
  ),
  market: (
    <>
      <path d="M4 10h16" />
      <path d="M6 10v9h12v-9" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M9 14h6" />
    </>
  ),
  property: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20V9l6-5 6 5v11" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  sound: (
    <>
      <path d="M4 14h4l5 4V6L8 10H4z" />
      <path d="M16 9c1 1 1 5 0 6" />
      <path d="M19 7c2 3 2 7 0 10" />
    </>
  ),
  tax: (
    <>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6" />
      <path d="M9 12h2M13 12h2M9 16h2M13 16h2" />
      <path d="M16 4v3h3" />
    </>
  ),
  tent: (
    <>
      <path d="M3 20 12 5l9 15" />
      <path d="M12 5v15" />
      <path d="M8 20l4-7 4 7" />
      <path d="M5 20h14" />
    </>
  ),
  timeline: (
    <>
      <path d="M6 5v14" />
      <path d="M6 7h10l2 2-2 2H6" />
      <path d="M6 15h8l2 2-2 2H6" />
    </>
  ),
  traffic: (
    <>
      <path d="M12 3v18" />
      <path d="M7 7h10l2 2-2 2H7z" />
      <path d="M5 15h10l2 2-2 2H5z" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h12v9H3z" />
      <path d="M15 10h3l3 3v3h-6" />
      <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </>
  ),
  venue: (
    <>
      <path d="M5 20V7l7-3 7 3v13" />
      <path d="M8 20v-7h8v7" />
      <path d="M9 9h6" />
      <path d="M12 4v4" />
    </>
  ),
  verified: (
    <>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </>
  )
};
