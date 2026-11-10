let context: AudioContext | null = null;
export function unlockSounds(): void {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume().catch(() => { });
  } catch {/* Scoring remains available if audio is unsupported. */ }
}
export function playDartSound(hit: boolean): void {
  unlockSounds();
  if (!context || context.state !== 'running') return;
  const audio = context;
  const now = audio.currentTime;
  const notes = hit ? [880, 1320] : [240];
  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + index * 0.045;
    const duration = hit ? 0.45 : 0.22;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    if (!hit) oscillator.frequency.exponentialRampToValueAtTime(180, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(hit ? 0.12 : 0.38, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  });
}
