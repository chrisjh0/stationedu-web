export type ClubCategory = 'Club' | 'Committee' | 'Union' | 'Team';

const CATEGORY_COLOR_MAP: Record<string, string> = {
  Club: '#DD5E54',
  Committee: '#232E54',
  Union: '#3C8A84',
  Team: '#BB8E33',
};

const FALLBACK_COLOR = '#DD5E54';

export function getClubColor(category: string): string {
  return CATEGORY_COLOR_MAP[category] ?? FALLBACK_COLOR;
}

export function getClubColorClass(category: string): string {
  return CATEGORY_COLOR_MAP[category] ?? FALLBACK_COLOR;
}

export function getClubColorSoft(category: string): string {
  return CATEGORY_COLOR_MAP[category] ?? FALLBACK_COLOR;
}

export const CLUB_TYPE_LABELS: Record<string, string> = {
  Club: 'Club',
  Committee: 'Committee',
  Team: 'Team',
  Union: 'Union',
  Other: 'Other',
};
