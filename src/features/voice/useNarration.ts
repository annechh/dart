import { useEffect, useRef, useState } from 'react';
export function useNarration(narrator: boolean) {
  const [speaking, setSpeaking] = useState(false);
  const narration = useRef<{
    timer?: ReturnType<typeof setTimeout>;
    spokenMessage?: SpeechSynthesisUtterance;
  }>({});
  function cancelNarration() {
    clearTimeout(narration.current.timer);
    if (narration.current.spokenMessage) {
      narration.current.spokenMessage.onend = null;
      narration.current.spokenMessage.onerror = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    narration.current = {};
    setSpeaking(false);
  }
  useEffect(() => () => {
    clearTimeout(narration.current.timer);
    if (narration.current.spokenMessage) {
      narration.current.spokenMessage.onend = null;
      narration.current.spokenMessage.onerror = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);
  function announce(text: string, onDone?: () => void) {
    if (!narrator || !('speechSynthesis' in window)) return;
    cancelNarration();
    setSpeaking(true);
    // Allow voice input to disconnect before the speakers start.
    narration.current.timer = setTimeout(() => {
      const spokenMessage = new SpeechSynthesisUtterance(text);
      spokenMessage.lang = 'en-GB';
      const done = () => {
        clearTimeout(narration.current.timer);
        narration.current.timer = setTimeout(() => {
          setSpeaking(false);
          narration.current = {};
          onDone?.();
        }, 300);
      };
      spokenMessage.onend = done;
      spokenMessage.onerror = done;
      narration.current.spokenMessage = spokenMessage;
      try {
        window.speechSynthesis.speak(spokenMessage);
      } catch {
        done();
      }
      // Recover microphone input even if the browser omits speech events.
      narration.current.timer = setTimeout(() => {
        cancelNarration();
      }, 15000);
    }, 150);
  }
  return {
    speaking,
    announce,
    cancelNarration
  };
}
