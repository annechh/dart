export default function ProfileAvatar({
  name,
  image
}: {
  name: string;
  image?: string;
}) {
  return image ? <img className="profile-avatar" src={image} alt="" /> : <span className="profile-avatar">{name.slice(0, 1).toUpperCase()}</span>;
}
