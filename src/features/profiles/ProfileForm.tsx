import { useState } from 'react';
import { prepareProfilePhoto } from '../../utils/prepareProfilePhoto';
import { profileStorageKey } from './profileStorage';
import type { Profile } from './types';
export default function ProfileForm({
  profiles,
  profile,
  names,
  onChange,
  onSave,
  onClose,
  busy,
  setBusy
}: {
  profiles: Profile[];
  profile?: Profile;
  names: string[];
  onChange: (names: string[]) => void;
  onSave: (profiles: Profile[]) => void;
  onClose: () => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
}) {
  const editingId = profile?.id ?? null;
  const [name, setName] = useState(profile?.name ?? '');
  const [image, setImage] = useState(profile?.image ?? '');
  const usesImageLink = /^https?:\/\//i.test(profile?.image ?? '');
  const [photoSource, setPhotoSource] = useState(usesImageLink ? 'link' : 'upload');
  const [imageUrl, setImageUrl] = useState(usesImageLink ? profile?.image ?? '' : '');
  const [error, setError] = useState('');
  return <form className="profile-form" onSubmit={e => {
    e.preventDefault();
    const playerName = name.trim();
    if (!playerName || profiles.some(p => p.id !== editingId && p.name.toLocaleLowerCase() === playerName.toLocaleLowerCase())) {
      setError('Enter a unique player name.');
      return;
    }
    let selectedImage = image;
    if (photoSource === 'link' && imageUrl.trim()) {
      try {
        const url = new URL(imageUrl.trim());
        if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid protocol');
        selectedImage = url.href;
      } catch {
        setError('Enter a valid http or https image link.');
        return;
      }
    } else if (photoSource === 'link') selectedImage = '';
    const previous = profiles.find(p => p.id === editingId);
    const updated = {
      id: editingId ?? crypto.randomUUID(),
      name: playerName,
      image: selectedImage
    };
    const next = editingId ? profiles.map(p => p.id === editingId ? updated : p) : [...profiles, updated];
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(next));
    } catch {
      setError('Could not save the profile. Browser storage may be full. Try a smaller photo.');
      return;
    }
    if (previous && previous.name !== playerName) onChange([...new Set(names.map(n => n === previous.name ? playerName : n))]);
    onSave(next);
    setName('');
    setImage('');
    setImageUrl('');
    setPhotoSource('upload');
    setError('');
    onClose();
  }}>
    <h3>{editingId ? 'Edit profile' : 'Add profile'}</h3>
    <label htmlFor="profile-name">Name</label>
    <input id="profile-name" required maxLength={30} value={name} onChange={e => setName(e.target.value)} />
    <span id="profile-photo-label">Photo (optional)</span>
    <div className="profile-photo-options" role="group" aria-labelledby="profile-photo-label">{([['upload', 'From computer'], ['link', 'Image link']] as const).map(([source, label]) => <button key={source} type="button" className={photoSource === source ? 'primary' : 'secondary'} aria-pressed={photoSource === source} disabled={busy} onClick={() => {
      setPhotoSource(source);
      setError('');
    }}>{label}</button>)}</div>{photoSource === 'link' ? <>
      <label htmlFor="profile-photo-url">Image link</label>
      <input id="profile-photo-url" type="url" placeholder="https://example.com/photo.jpg" value={imageUrl} onChange={e => {
        setImageUrl(e.target.value);
        setError('');
      }} />
      <p className="muted small">Paste a direct link to an image. The image must stay available online.</p>
    </> : <>
      <label htmlFor="profile-photo">Choose photo</label>
      <input id="profile-photo" type="file" accept="image/*" onChange={async e => {
        const file = e.target.files?.[0];
        setImage('');
        setError('');
        if (!file) return;
        setBusy(true);
        try {
          setImage(await prepareProfilePhoto(file));
        } catch {
          setError('Could not read this image. Choose another photo.');
        } finally {
          setBusy(false);
        }
      }} />
    </>}{(photoSource === 'upload' ? image : /^https?:\/\//i.test(imageUrl.trim()) && imageUrl.trim()) && <img key={photoSource === 'upload' ? image : imageUrl.trim()} className="profile-preview" src={photoSource === 'upload' ? image : imageUrl.trim()} alt="Profile preview" onError={() => setError('Could not load this image. Check the link or choose another photo.')} />}{error && <p role="alert" className="notice">{error}</p>}<button className="primary" disabled={busy}>{busy ? 'Preparing photo…' : editingId ? 'Save changes' : 'Save profile'}</button>
  </form>;
}
