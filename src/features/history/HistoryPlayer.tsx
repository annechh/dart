import ProfileAvatar from '../profiles/ProfileAvatar';

export default function HistoryPlayer({ name, image }: { name: string; image?: string }) {
  return <span className="history-player">
    <span aria-hidden="true"><ProfileAvatar name={name} image={image} /></span>
    {name}
  </span>;
}
