export type MicLogEntry = {
  time: string;
  transcript: string;
  result: string;
};
export const micLogKey = 'dart-web-mic-log-v1';
export function loadMicLog(): MicLogEntry[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(micLogKey) || '[]');
    return Array.isArray(data) ? data.filter((entry): entry is MicLogEntry => entry && typeof entry.time === 'string' && typeof entry.transcript === 'string' && typeof entry.result === 'string').slice(0, 500) : [];
  } catch {
    return [];
  }
}
