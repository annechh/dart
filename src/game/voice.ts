import type { Dart } from './scoring';
export function cleanUpVoiceCommand(text: string): string {
  return text.toLowerCase().replace(/\b(add|adds|and|at|att|ad|ads)\b/g, 'add').replace(/\bones\b/g, 'one').replace(/\bto\b/g, 'two').replace(/\bton\b/g, 'ten').replace(/\btree\b/g, 'three');
}
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export function parseVoiceDart(transcript: string): Dart | null {
  const text = transcript.toLowerCase().replace(/\bones\b/g, 'one').replace(/\bto\b/g, 'two').replace(/\bton\b/g, 'ten').replace(/\btree\b/g, 'three').replace(/[.,!?]/g, '').trim().replace(/\s+/g, ' ');
  if (!text.startsWith('add ')) return null;
  let target = text.slice(4).replace(/\b(ball|bowl)\b/g, 'bull');
  if (target === 'zero' || target === '0') return {
    number: 0,
    multiplier: 1
  };
  if (['bull', 'bullseye', 'bulls eye', 'bullseye 50'].includes(target)) return {
    number: 25,
    multiplier: 2
  };
  if (target === 'outer bull') return {
    number: 25,
    multiplier: 1
  };
  let multiplier: 1 | 2 | 3 = 1;
  const prefix = /^(single|double|triple|treble) /.exec(target);
  if (prefix) {
    multiplier = prefix[1] === 'double' ? 2 : ['triple', 'treble'].includes(prefix[1]) ? 3 : 1;
    target = target.slice(prefix[0].length);
  }
  if (target === 'bull' && multiplier !== 3) return {
    number: 25,
    multiplier
  };
  const number = /^\d+$/.test(target) ? Number(target) : target === 'twenty five' || target === 'twenty-five' ? 25 : words.indexOf(target);
  if (number >= 1 && number <= 20 || number === 25 && multiplier !== 3) return {
    number,
    multiplier
  };
  return null;
}

// Find one explicit command anywhere in conversation; never score a bare number.
export function findVoiceDart(transcript: string, readyForScore = false): Dart | null {
  const text = cleanUpVoiceCommand(transcript).replace(/[.,!?]/g, ' ').trim().replace(/\s+/g, ' ');
  const trigger = /\badd\s+/.exec(text);
  const target = (trigger ? text.slice(trigger.index + trigger[0].length) : readyForScore ? text : '').replace(/\b(ball|bowl)\b/g, 'bull');
  const match = /^(?:(single|double|triple|treble)\s+)?(outer bull|bulls eye|bullseye|bull|twenty[ -]five|\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?=\s|$)/.exec(target);
  return match ? parseVoiceDart(`add ${match[0]}`) : null;
}

// Explicit separators mean separate darts, never a summed turn total.
export function findVoiceDarts(transcript: string, readyForScore = false): Dart[] | null {
  const text = cleanUpVoiceCommand(transcript).replace(/[.,!?]/g, ' ').trim();
  const trigger = /\badd\b/.exec(text);
  if (!trigger && !readyForScore) return null;
  const targets = (trigger ? text.slice(trigger.index + trigger[0].length) : text).replace(/\bplus\b|\+/g, ' add ').split(/\badd\b/).map(part => part.trim());
  if (targets.some(target => !target)) return null;
  const darts = targets.map(target => findVoiceDart(target, true));
  return darts.every((dart): dart is Dart => dart !== null) ? darts : null;
}
