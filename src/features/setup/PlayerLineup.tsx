import HistoryPlayer from '../history/HistoryPlayer';
import { loadProfiles } from '../profiles/profileStorage';
export default function PlayerLineup({
  names,
  onRemove
}: {
  names: string[];
  onRemove: (name: string) => void;
}) {
  const profiles = loadProfiles();
  return <ul className="player-lineup" aria-label="Players added to play">{names.map(name => <li key={name}>
    <HistoryPlayer name={name} image={profiles.find(profile => profile.name === name)?.image} />
    <button type="button" className="text-button" aria-label={`Remove ${name} from lineup`} onClick={() => onRemove(name)}>Remove</button>
  </li>)}</ul>;
}
