import { describe, expect, it } from 'vitest'
import { checkoutSuggestions, createMatch, endTurn, getState, points, recordThrow, undoThrow, type Dart, type Match } from '../../src/game/scoring'

const dart = (number: number, multiplier: 1 | 2 | 3 = 1): Dart => ({ number, multiplier })
function leave61(): Match {
  let match = createMatch(['Ada', 'Ben'])
  for (let turn = 0; turn < 2; turn++) {
    match = recordThrow(recordThrow(match, dart(20, 3)), dart(20, 3))
    match = endTurn(endTurn(match))
  }
  return match
}
describe('301 scoring', () => {
  it('starts each player on 301 and rejects invalid darts', () => {
    expect(getState(createMatch(['Ada', 'Ben'])).scores).toEqual([301, 301])
    expect(() => points(dart(25, 3))).toThrow()
    expect(() => createMatch([])).toThrow()
  })
  it('limits turns to three darts and advances only explicitly', () => {
    let match = createMatch(['Ada', 'Ben'])
    for (let i = 0; i < 3; i++) match = recordThrow(match, dart(20))
    expect(getState(match).turn.status).toBe('complete')
    expect(() => recordThrow(match, dart(20))).toThrow()
    expect(getState(endTurn(match)).player).toBe(1)
  })
  it('restores the entire turn on a bust and undo restores the prior throw', () => {
    let match = recordThrow(leave61(), dart(20))
    match = recordThrow(match, dart(20, 3))
    expect(getState(match).scores[0]).toBe(61)
    expect(getState(match).turn.status).toBe('bust')
    expect(getState(undoThrow(match)).scores[0]).toBe(41)
  })
  it('busts on one remaining or a non-double finish in double-out', () => {
    expect(getState(recordThrow(leave61(), dart(20, 3))).turn.status).toBe('bust')
    const match = recordThrow(recordThrow(leave61(), dart(19, 3)), dart(4))
    expect(getState(match).turn.status).toBe('bust')
  })
  it('accepts double finishes, and undo reopens a won match', () => {
    const match = recordThrow(recordThrow(leave61(), dart(19, 3)), dart(2, 2))
    expect(getState(match).winner).toBe(0)
    expect(getState(undoThrow(match)).scores[0]).toBe(4)
    expect(getState(undoThrow(match)).winner).toBeNull()
  })
  it('accepts a single finish for single-out', () => {
    const match = { ...leave61(), outRule: 'single' as const }
    expect(getState(recordThrow(recordThrow(match, dart(20, 3)), dart(1))).winner).toBe(0)
  })
  it('undo crosses a player transition and misses consume a dart', () => {
    const match = endTurn(recordThrow(createMatch(['Ada', 'Ben']), dart(0)))
    expect(getState(undoThrow(match)).player).toBe(0)
    expect(getState(undoThrow(match)).turn.darts).toHaveLength(0)
  })
})
describe('checkout suggestions', () => {
  it('offers the requested 64 checkoutOptions', () => {
    expect(checkoutSuggestions(64, 2, 'single')[0]).toEqual([dart(20, 3), dart(4)])
    expect(checkoutSuggestions(64, 2, 'double')[0]).toEqual([dart(20, 3), dart(2, 2)])
  })
  it('handles bull finishes and impossible checkouts', () => {
    expect(checkoutSuggestions(50, 1, 'double')[0]).toEqual([dart(25, 2)])
    expect(checkoutSuggestions(169, 3, 'double')).toEqual([])
    expect(checkoutSuggestions(1, 3, 'double')).toEqual([])
    expect(checkoutSuggestions(64, 1, 'double')).toEqual([])
  })
  it('returns valid checkoutOptions across all finishing scores', () => {
    for (const rule of ['single', 'double'] as const) {
      for (let score = 1; score <= 180; score++) {
        for (const route of checkoutSuggestions(score, 3, rule)) {
          expect(route.reduce((sum, dart) => sum + points(dart), 0)).toBe(score)
          expect(route.length).toBeLessThanOrEqual(3)
          if (rule === 'double') expect(route.at(-1)?.multiplier).toBe(2)
        }
      }
    }
  })
})

 describe('fair ending', () => {
  it('keeps the match open until the last player finishes and allows shared wins', () => {
    let match: Match = { ...leave61(), fairEnding: true }
    match = recordThrow(recordThrow(match, dart(19, 3)), dart(2, 2))
    expect(getState(match).winner).toBeNull()
    expect(getState(match).finalRound).toBe(true)
    match = endTurn(match)
    // Ben still starts on 301 in this fixture and gets his final turn.
    match = recordThrow(recordThrow(recordThrow(match, dart(20)), dart(20)), dart(20))
    expect(getState(match).winner).toBe(0)
    expect(getState(undoThrow(match)).winner).toBeNull()
  })
  it('records both checkouts in the same round as shared winners', () => {
    let match = createMatch(['Ada', 'Ben'], 'single', true)
    for (let round = 0; round < 2; round++) {
      for (let player = 0; player < 2; player++) {
        match = recordThrow(recordThrow(match, dart(20, 3)), dart(20, 3))
        match = endTurn(match)
      }
    }
    match = recordThrow(recordThrow(match, dart(20, 3)), dart(1))
    expect(getState(match).winner).toBeNull()
    match = endTurn(match)
    match = recordThrow(recordThrow(match, dart(20, 3)), dart(1))
    expect(getState(match).winners).toEqual([0, 1])
    expect(getState(match).winner).toBe(0)
  })
})

it('edits historical darts and recalculates later scores without losing turns', async () => {
  const { editTurn } = await import('../../src/game/scoring')
  let match = createMatch(['Anne', 'Alan'])
  match = endTurn(recordThrow(match, dart(1)))
  match = endTurn(recordThrow(match, dart(5)))
  match = recordThrow(match, dart(10))
  const corrected = editTurn(match, 0, [dart(20, 3), dart(15)])
  expect(getState(corrected).scores).toEqual([216, 296])
  expect(getState(corrected).history).toHaveLength(2)
  expect(getState(corrected).turn.darts).toEqual([dart(10)])
  expect(getState(match).scores).toEqual([290, 296])
})
it('rejects corrections that would make later recorded darts invalid', async () => {
  const { editTurn } = await import('../../src/game/scoring')
  let match = createMatch(['Anne'], 'single')
  match = endTurn(recordThrow(match, dart(0)))
  match = endTurn(recordThrow(recordThrow(recordThrow(match, dart(20, 3)), dart(20, 3)), dart(20, 3)))
  match = recordThrow(recordThrow(recordThrow(match, dart(20, 3)), dart(20, 3)), dart(1))
  expect(() => editTurn(match, 0, [dart(20, 3)])).toThrow('later darts invalid')
})

describe('Shanghai', () => {
  it('scores only the current target and wins immediately with all three rings', () => {
    let match = createMatch(['Ada', 'Ben'], 'double', true, 'shanghai')
    match = recordThrow(match, dart(20, 3))
    expect(getState(match).scores).toEqual([0, 0])
    match = undoThrow(match)
    for (const multiplier of [3, 1, 2] as const) {
      match = recordThrow(match, dart(1, multiplier))
    }
    expect(getState(match)).toMatchObject({ winner: 0, scores: [6, 0] })
  })

  it.each([7, 20] as const)('gives both players %i turns and shares a tied highest score', rounds => {
    let match = createMatch(['Ada', 'Ben'], 'double', false, 'shanghai', rounds)
    for (let target = 1; target <= rounds; target++) {
      for (let player = 0; player < 2; player++) {
        expect(getState(match)).toMatchObject({ player, winner: null, turn: { target } })
        match = endTurn(recordThrow(match, dart(target)))
      }
    }
    const total = rounds * (rounds + 1) / 2
    expect(getState(match)).toMatchObject({ winners: [0, 1], scores: [total, total] })
  })
})
