import { dartLabel } from '../../game/scoring';
import type { MatchController } from './useMatch';
export default function CheckoutSuggestions({
  checkoutOptions,
  state
}: Pick<MatchController, 'checkoutOptions' | 'state'>) {
  if (!state) return null;
  return <section className="checkout-panel score-checkout">
    <p className="eyebrow">THE WAY OUT</p>
    <h2>Checkout suggestions</h2>{checkoutOptions.length ? checkoutOptions.map((route, i) => <div className="checkout-route" key={i}>
      <span>{i === 0 ? '01' : `0${i + 1}`}</span>
      <strong>{route.map(dartLabel).join(' → ')}</strong>
    </div>) : <p className="muted small">{state.winner !== null ? 'Nice finish. Ready for a rematch?' : state.turn.status !== 'playing' ? 'Suggestions return with the next turn.' : 'No checkout with the darts remaining. Build your next finish.'}</p>}<p className="small muted checkout-note">S = single · D = double · T = triple · D25 = bull</p>
  </section>;
}
