import { expect, it } from 'vitest'
import { createMatch, endTurn, recordThrow, undoThrow } from '../../src/game/scoring'
import { checkoutAnnouncement, startsNewTurn } from '../../src/game/narrator'
it('announces the first turn and forward player switches only', () => {
  const start = createMatch(['Ada', 'Ben'])
  const thrown = recordThrow(start, { number: 20, multiplier: 1 })
  const switched = endTurn(thrown)
  expect(startsNewTurn(null, start)).toBe(true)
  expect(startsNewTurn(start, thrown)).toBe(false)
  expect(startsNewTurn(thrown, switched)).toBe(true)
  expect(startsNewTurn(switched, undoThrow(switched))).toBe(false)
  expect(startsNewTurn(switched, null)).toBe(false)
  expect(startsNewTurn(start, endTurn(start))).toBe(true)
})

it('announces remaining score only when a finish is possible with the darts left', () => {
  let match = createMatch(['Ada'])
  expect(checkoutAnnouncement(match)).toBe('')
  for (let i = 0; i < 2; i++) {
    match = endTurn(recordThrow(recordThrow(match, { number: 20, multiplier: 3 }), { number: 20, multiplier: 3 }))
  }
  expect(checkoutAnnouncement(match)).toBe('You have 61 remaining.')
  match = recordThrow(recordThrow(match, { number: 0, multiplier: 1 }), { number: 0, multiplier: 1 })
  expect(checkoutAnnouncement(match)).toBe('')
  const single = recordThrow({ ...endTurn(match), outRule: 'single' }, { number: 20, multiplier: 3 })
  expect(checkoutAnnouncement(single)).toBe('You have 1 remaining.')
  expect(checkoutAnnouncement(recordThrow(single, { number: 1, multiplier: 1 }))).toBe('')
})
