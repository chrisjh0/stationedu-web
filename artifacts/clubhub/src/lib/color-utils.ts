const CATEGORY_COLORS = [
  '#C56A4A', // arts
  '#BB8E33', // athletics
  '#6F9266', // environment
  '#3C8A84', // stem
  '#5A7BA6', // academic
  '#8A5E8C', // culture
  '#BE6385', // service
];

export function getClubColor(id: number): string {
  return CATEGORY_COLORS[id % CATEGORY_COLORS.length];
}

export function getClubColorClass(id: number): string {
  // Returns inline style string for backgrounds
  return CATEGORY_COLORS[id % CATEGORY_COLORS.length];
}

export function getClubColorSoft(id: number): string {
  // Light tint version — used for category badges
  const hex = CATEGORY_COLORS[id % CATEGORY_COLORS.length];
  return hex;
}

// Map club type to a display label
export const CLUB_TYPE_LABELS: Record<string, string> = {
  Club: 'Club',
  Committee: 'Committee',
  Team: 'Team',
  Union: 'Union',
  Other: 'Other',
};
