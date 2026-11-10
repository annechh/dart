import { expect, it } from 'vitest'
import { createMatch, recordThrow, endTurn, undoThrow } from '../../src/game/scoring'
import { playerStats, turnAnnouncement } from '../../src/game/stats'
it('counts solo rounds and preserves multiplayer names', () => {
  const match = createMatch(['Ada'])
  expect(turnAnnouncement(match)).toBe('Round 1.')
  expect(turnAnnouncement(endTurn(match))).toBe('Round 2.')
  expect(turnAnnouncement(endTurn(createMatch(['Ada', 'Ben'])))).toBe('Ben, your turn.')
})
it('includes misses and bust darts in averages and recalculates undo', () => {
  let match = createMatch(['Ada'])
  expect(playerStats(match, 0).average).toBeNull()
  match = recordThrow(recordThrow(match, { number: 20, multiplier: 3 }), { number: 0, multiplier: 1 })
  expect(playerStats(match, 0)).toEqual({ darts: 2, average: 30, threeDartAverage: 90 })
  match = endTurn(recordThrow(match, { number: 20, multiplier: 3 }))
  match = endTurn(recordThrow(recordThrow(match, { number: 20, multiplier: 3 }), { number: 20, multiplier: 3 }))
  match = recordThrow(match, { number: 20, multiplier: 3 })
  expect(playerStats(match, 0).darts).toBe(6)
  expect(playerStats(match, 0).average).toBe(40)
  expect(playerStats(undoThrow(match), 0).average).toBe(48)
})

it('compares practice with a dart-weighted multiplayer average and ignores solo history', async () => {
  const { multiplayerAverage, practiceFeedback } = await import('../../src/game/stats')
  function finish(players: string[], misses = 0) {
    let match = createMatch(players, 'single')
    for (let i = 0; i < misses; i++) {
      match = endTurn(recordThrow(match, { number: 0, multiplier: 1 }))
      if (players.length > 1) match = endTurn(match)
    }
    match = recordThrow(recordThrow(recordThrow(match, { number: 20, multiplier: 3 }), { number: 20, multiplier: 3 }), { number: 20, multiplier: 3 })
    match = endTurn(match)
    if (players.length > 1) match = endTurn(match)
    return recordThrow(recordThrow(recordThrow(match, { number: 20, multiplier: 3 }), { number: 20, multiplier: 3 }), { number: 1, multiplier: 1 })
  }
  const fast = finish(['Anne', 'Alan'])
  const slow = finish(['Anne', 'Alan'], 2)
  const solo = finish(['Anne'])
  expect(multiplayerAverage([fast, slow, solo], 'Anne')).toEqual({ average: 602 / 14, games: 2 })
  expect(practiceFeedback(solo, [])).toBe('Practice done. Good work!')
  expect(practiceFeedback(solo, [slow])).toContain('above')
  expect(practiceFeedback(finish(['Anne'], 3), [fast])).toContain('below')
  expect(practiceFeedback(solo, [fast])).toContain('level with')
  expect(multiplayerAverage([fast], 'Unknown').average).toBeNull()
  expect(multiplayerAverage([createMatch(['Anne', 'Alan'])], 'Anne').games).toBe(0)
})
