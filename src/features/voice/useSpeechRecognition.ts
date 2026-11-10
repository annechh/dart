import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { loadMicLog, micLogKey, type MicLogEntry } from '../../game/micLog';
import { dartLabel, type Dart } from '../../game/scoring';
import { findVoiceDarts, cleanUpVoiceCommand } from '../../game/voice';
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  abort(): void;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<{
      isFinal: boolean;
      0: {
        transcript: string;
      };
    }>;
  }) => void) | null;
  onerror: ((event: {
    error: string;
  }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
const speechWindow = window as SpeechWindow;
const RecognitionClass = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
export function useSpeechRecognition({
  solo,
  paused,
  disabled,
  finished,
  onThrows,
  onSwitchPlayer
}: {
  solo: boolean;
  paused: boolean;
  disabled: boolean;
  finished: boolean;
  onThrows: (darts: Dart[]) => number;
  onSwitchPlayer: () => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('Microphone off');
  const [heard, setHeard] = useState('');
  const [micLog, setMicLog] = useState(loadMicLog);
  const micLogRef = useRef(micLog);
  const [logError, setLogError] = useState(false);
  function saveLog(entries: MicLogEntry[]) {
    micLogRef.current = entries;
    setMicLog(entries);
    try {
      localStorage.setItem(micLogKey, JSON.stringify(entries));
      setLogError(false);
    } catch {
      setLogError(true);
    }
  }
  function exportLog() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(micLogRef.current, null, 2)], {
      type: 'application/json'
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dart-microphone-log.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const readyForScore = useRef(false);
  const [scoringActive, setScoringActive] = useState(false);
  const handleVoiceCommand = useEffectEvent((text: string) => {
    function report(result: string) {
      setStatus(result);
      saveLog([{
        time: new Date().toISOString(),
        transcript: text,
        result
      }, ...micLogRef.current].slice(0, 500));
    }
    if (paused) {
      report('Ignored while narrator is speaking.');
      return;
    }
    setHeard(text);
    if (text.toLowerCase().replace(/[.,!?]/g, '').trim().replace(/\s+/g, ' ') === (solo ? 'next round' : 'switch player')) {
      readyForScore.current = false;
      setScoringActive(false);
      if (finished) {
        report('Match finished. Start a new match to continue.');
        return;
      }
      onSwitchPlayer();
      report(solo ? 'Next round. Ready for the next dart.' : 'Switched player. Ready for the next dart.');
      return;
    }
    const command = cleanUpVoiceCommand(text).replace(/[.,!?]/g, '').trim().replace(/\s+/g, ' ');
    if (command === 'stop scoring') {
      readyForScore.current = false;
      setScoringActive(false);
      report('Score entry paused. Say add to activate it again.');
      return;
    }
    const wasReadyForScore = readyForScore.current;
    if (command === 'add' || /\badd\b/.test(command)) {
      readyForScore.current = true;
      setScoringActive(true);
      if (command === 'add') {
        report('Score entry active. Say a number or target.');
        return;
      }
    }
    if (!readyForScore.current) {
      report('Say add to activate score entry.');
      return;
    }
    const darts = findVoiceDarts(text, wasReadyForScore);
    readyForScore.current = false;
    setScoringActive(false);
    if (!darts) {
      report('Targets not recognised. Say add and valid dart targets to try again.');
      return;
    }
    if (disabled) {
      report(solo ? 'Round finished. Say next round to continue.' : 'Turn finished. Say switch player to continue.');
      return;
    }
    const count = onThrows(darts);
    report(`Added ${darts.slice(0, count).map(dartLabel).join(', ')}.${count < darts.length ? ' Remaining targets ignored because this turn ended.' : ''} Waiting for add again.`);
  });
  useEffect(() => {
    if (!enabled || !RecognitionClass || finished || paused) return;
    const recognition = new RecognitionClass();
    let active = true;
    let failed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    recognition.lang = 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onstart = () => {
      if (active) setStatus(readyForScore.current ? 'Listening for scores' : 'Listening · say add to activate score entry');
    };
    recognition.onresult = event => {
      if (!active) return;
      const phrases: string[] = [];
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) phrases.push(event.results[i][0].transcript);
      }
      if (phrases.length) handleVoiceCommand(phrases.join(' '));
    };
    recognition.onerror = event => {
      if (!active || event.error === 'aborted' || event.error === 'no-speech') return;
      failed = true;
      setEnabled(false);
      setStatus(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? 'Microphone permission denied. Allow microphone access in your browser, then try again.' : event.error === 'network' ? 'Speech service unavailable. Check your connection and try again.' : `Voice input stopped (${event.error}). Try enabling it again.`);
    };
    const start = () => {
      if (!active || failed) return;
      try {
        recognition.start();
      } catch {
        failed = true;
        setEnabled(false);
        setStatus('Could not start voice input. Try again.');
      }
    };
    recognition.onend = () => {
      if (active && !failed) timer = setTimeout(start, 400);
    };
    start();
    return () => {
      active = false;
      clearTimeout(timer);
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onstart = null;
      recognition.abort();
    };
  }, [enabled, finished, paused]);
  function toggleMicrophone() {
    readyForScore.current = false;
    setScoringActive(false);
    setEnabled(!enabled);
    setStatus(enabled ? 'Microphone off' : 'Starting microphone…');
  }
  return {
    enabled,
    status,
    heard,
    micLog,
    logError,
    saveLog,
    exportLog,
    scoringActive,
    toggleMicrophone,
    supported: !!RecognitionClass
  };
}
