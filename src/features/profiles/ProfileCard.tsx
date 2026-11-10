import ProfileAvatar from './ProfileAvatar';
export default function ProfileCard({
  name,
  image,
  selected,
  onClick
}: {
  name: string;
  image?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return <button type="button" className="profile-card" aria-pressed={selected} onClick={onClick}>
    <ProfileAvatar name={name} image={image} />
    <span>{name}</span>
  </button>;
}
