import ProfileAvatar from './ProfileAvatar';
export default function ProfileCard({
  name,
  image,
  selected,
  onClick,
  remove
}: {
  name: string;
  image?: string;
  selected?: boolean;
  onClick: () => void;
  remove?: boolean;
}) {
  return <button type="button" className="profile-card" aria-pressed={selected} onClick={onClick} aria-label={remove ? `Remove ${name} from lineup` : undefined} title={remove ? `Remove ${name}` : undefined}>
    <ProfileAvatar name={name} image={image} />
    <span>{name}</span>
  </button>;
}
