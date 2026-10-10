export const ratingOptions = [
  {
    value: -1,
    label: "Hard Limit",
    className: "rating-hard-limit",
    color: "#000000",
    description: "A trust-breaking boundary that immediately ends the session.",
    // Icon paths are from Bootstrap Icons (16x16 viewBox).
    path: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z",
  },
  {
    value: 0,
    label: "Never",
    className: "rating-never",
    color: "#920000",
    description:
      "A dangerous line that should be avoided, but the session might be saved.",
    path: "M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2z",
  },
  {
    value: 1,
    label: "Ask Me",
    className: "rating-ask",
    color: "#fdfd68",
    description: "Requires explicit consent before proceeding.",
    path: "M7.022 1.566a1.13 1.13 0 0 1 1.96 0l6.857 11.667c.457.778-.092 1.767-.98 1.767H1.144c-.889 0-1.437-.99-.98-1.767z",
  },
  {
    value: 2,
    label: "Willing",
    className: "rating-willing",
    color: "#ffa500",
    description: "Acceptable, although not preferred.",
    path: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0",
  },
  {
    value: 3,
    label: "Love",
    className: "rating-love",
    color: "#23fd22",
    description: "Highly desired and brings joy.",
    path: "M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314",
  },
  {
    value: 4,
    label: "Crave",
    className: "rating-crave",
    color: "#007fff",
    description: "Deeply desired. This says 'please proceed with enthusiasm'.",
    path: "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z",
  },
] as const;

export type RatingOption = (typeof ratingOptions)[number];

// Angles are in degrees, 0 = up, increasing clockwise. Each sector spans 36°;
// the downward 108-252° range is intentionally unassigned.
export const dragSectors: ReadonlyArray<{ value: number; start: number }> = [
  { value: 2, start: 0 },
  { value: 3, start: 36 },
  { value: 4, start: 72 },
  { value: -1, start: 252 },
  { value: 0, start: 288 },
  { value: 1, start: 324 },
];

export const DRAG_SECTOR_SIZE = 36;

export function getDragAngle(dx: number, dy: number) {
  const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (angle + 360) % 360;
}

export function getRatingForAngle(angle: number) {
  const sector = dragSectors.find(
    ({ start }) => angle >= start && angle < start + DRAG_SECTOR_SIZE,
  );
  return ratingOptions.find((option) => option.value === sector?.value);
}
