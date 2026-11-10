import type { Profile } from './types';
export const profileStorageKey = 'dart-web-profiles-v1';
export function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(profileStorageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(p => typeof p.id === 'string' && typeof p.name === 'string' && typeof p.image === 'string')) return parsed;
  } catch {/* Keep profiles usable when storage is unavailable. */ }
  return [];
}
