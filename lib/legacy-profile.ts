export type LegacyProfile = {
  name: string;
  className: string;
  interests: string;
  about: string;
  solvedRiddles: string[];
  readStories: string[];
};

export const LEGACY_PROFILE_KEY = 'shabyt-profile-v1';

export function readLegacyProfile(): LegacyProfile | null {
  try {
    const stored = window.localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!stored) return null;
    const raw = JSON.parse(stored);
    const text = (value: unknown, max: number) => typeof value === 'string' ? value.slice(0, max) : '';
    const ids = (value: unknown) => Array.isArray(value)
      ? [...new Set(value.filter((item): item is string => typeof item === 'string' && item.length < 100))].slice(0, 500)
      : [];
    return {
      name: text(raw.name, 70),
      className: text(raw.className, 70),
      interests: text(raw.interests, 100),
      about: text(raw.about, 500),
      solvedRiddles: ids(raw.solvedRiddles),
      readStories: ids(raw.readStories),
    };
  } catch { return null; }
}
