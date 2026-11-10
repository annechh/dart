import { useState } from 'react';
export function useAudioPreferences() {
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem('dart-web-sounds') !== 'off';
    } catch {
      return true;
    }
  });
  const [narrator, setNarrator] = useState(() => {
    try {
      return localStorage.getItem('dart-web-narrator') !== 'off';
    } catch {
      return true;
    }
  });
  return {
    sound,
    setSound,
    narrator,
    setNarrator
  };
}
