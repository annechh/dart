import { expect, it } from 'vitest'
import { parseVoiceDart, findVoiceDart } from '../../src/game/voice'
it('parses one dart only with an explicit add command', () => {
  expect(parseVoiceDart('Add double sixteen.')).toEqual({ number: 16, multiplier: 2 })
  expect(parseVoiceDart('add treble 20')).toEqual({ number: 20, multiplier: 3 })
  expect(parseVoiceDart('add twenty')).toEqual({ number: 20, multiplier: 1 })
  expect(parseVoiceDart('add bull')).toEqual({ number: 25, multiplier: 2 })
  expect(parseVoiceDart('add outer bull')).toEqual({ number: 25, multiplier: 1 })
  expect(parseVoiceDart('add zero')).toEqual({ number: 0, multiplier: 1 })
})
it('ignores conversation, totals, invalid targets, and multiple darts', () => {
  for (const text of ['twenty', 'please add twenty', 'add sixty', 'add triple 25', 'add -1', 'add twenty and double sixteen', 'add 21', 'add', 'add double zero']) expect(parseVoiceDart(text)).toBeNull()
})


it('finds one add command inside conversation', () => {
  expect(findVoiceDart('no no add 15')).toEqual({ number: 15, multiplier: 1 })
  expect(findVoiceDart('oh shiiit add fifteen')).toEqual({ number: 15, multiplier: 1 })
  expect(findVoiceDart('we were chatting add double sixteen nice')).toEqual({ number: 16, multiplier: 2 })
  expect(findVoiceDart('add twenty add sixteen')).toEqual({ number: 20, multiplier: 1 })
  expect(findVoiceDart('fifteen')).toBeNull()
  expect(findVoiceDart('fifteen', true)).toEqual({ number: 15, multiplier: 1 })
  expect(findVoiceDart('add 150')).toBeNull()
  expect(findVoiceDart('add triple 25')).toBeNull()
})

it('accepts single and double bull including common speech substitutions', () => {
  for (const word of ['bull', 'ball', 'bowl']) {
    expect(findVoiceDart(`oh no add single ${word}`)).toEqual({ number: 25, multiplier: 1 })
    expect(findVoiceDart(`add double ${word}`)).toEqual({ number: 25, multiplier: 2 })
    expect(findVoiceDart(`add triple ${word}`)).toBeNull()
  }
})
it('accepts close trigger spellings without matching inside words', () => {
  for (const trigger of ['add', 'adds', 'and', 'at', 'att', 'ad', 'ads']) {
    expect(findVoiceDart(`oh no ${trigger} fifteen`)).toEqual({ number: 15, multiplier: 1 })
    expect(findVoiceDart(`${trigger} double bowl`)).toEqual({ number: 25, multiplier: 2 })
  }
  expect(findVoiceDart('that fifteen')).toBeNull()
  expect(findVoiceDart('glad fifteen')).toBeNull()
  expect(findVoiceDart('at sixty')).toBeNull()
})


it('accepts ones as one for singles, doubles, and triples', () => {
  expect(findVoiceDart('add ones')).toEqual({ number: 1, multiplier: 1 })
  expect(findVoiceDart('add double ones')).toEqual({ number: 1, multiplier: 2 })
  expect(findVoiceDart('add triple ones')).toEqual({ number: 1, multiplier: 3 })
  expect(findVoiceDart('ones', true)).toEqual({ number: 1, multiplier: 1 })
})

it('accepts chained voice darts with plus signs, spoken plus, repeated add, and mixed separators', async () => {
  const { findVoiceDarts } = await import('../../src/game/voice')
  const expected = [20, 15, 3].map(number => ({ number, multiplier: 1 }))
  for (const text of ['add 20 + 15 + 3', 'add twenty plus fifteen plus three', 'add 20, add 15 + 3', 'add 20 add 15 add 3', 'oh no add 20 plus 15 plus 3']) expect(findVoiceDarts(text)).toEqual(expected)
  expect(findVoiceDarts('add triple twenty plus double bull')).toEqual([{ number: 20, multiplier: 3 }, { number: 25, multiplier: 2 }])
  expect(findVoiceDarts('20 plus 15', true)).toEqual(expected.slice(0, 2))
  expect(findVoiceDarts('20')).toBeNull()
  expect(findVoiceDarts('add 20 plus 150')).toBeNull()
  expect(findVoiceDarts('add 20 plus')).toBeNull()
})

it('recognises to as two in single and chained commands', async () => {
  const { findVoiceDarts } = await import('../../src/game/voice')
  expect(findVoiceDart('add to')).toEqual({ number: 2, multiplier: 1 })
  expect(findVoiceDart('add double to')).toEqual({ number: 2, multiplier: 2 })
  expect(findVoiceDarts('add twenty plus to')).toEqual([{ number: 20, multiplier: 1 }, { number: 2, multiplier: 1 }])
  expect(findVoiceDart('to', true)).toEqual({ number: 2, multiplier: 1 })
})

it('recognises ton as ten in single and chained commands', async () => {
  const { findVoiceDarts } = await import('../../src/game/voice')
  expect(parseVoiceDart('add ton')).toEqual({ number: 10, multiplier: 1 })
  expect(findVoiceDart('add double ton')).toEqual({ number: 10, multiplier: 2 })
  expect(findVoiceDarts('add ton plus to')).toEqual([{ number: 10, multiplier: 1 }, { number: 2, multiplier: 1 }])
  expect(findVoiceDart('ton', true)).toEqual({ number: 10, multiplier: 1 })
})
