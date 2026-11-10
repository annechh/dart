import ProfileCard from '../profiles/ProfileCard';
import { loadProfiles } from '../profiles/profileStorage';
export default function PlayerLineup({
  names,
  onRemove
}: {
  names: string[];
  onRemove: (name: string) => void;
}) {
  const profiles = loadProfiles();
  return <div className="profile-grid" aria-label="Players added to play">{names.map(name => <ProfileCard key={name} name={name} image={profiles.find(profile => profile.name === name)?.image} onClick={() => onRemove(name)} remove />)}</div>;
}
