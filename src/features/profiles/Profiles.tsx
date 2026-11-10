import { useState } from 'react';
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import { loadProfiles } from './profileStorage';
export default function Profiles({
  names,
  onChange
}: {
  names: string[];
  onChange: (names: string[]) => void;
}) {
  const [profiles, setProfiles] = useState(loadProfiles);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const guest = guestName.trim();
  const canAddGuest = guest !== '' && !names.includes(guest);
  return <section className="panel profiles">
    <div className="section-title">
      <h2>Player profiles</h2>
      <div className="profile-actions">
        <button type="button" className="secondary" aria-expanded={showGuestForm} onClick={() => setShowGuestForm(!showGuestForm)}>+ Add guest</button>
        <button type="button" className="secondary" disabled={busy} onClick={() => {
          setAdding(!adding);
          setEditingId(null);
        }}>{adding ? 'Close' : '+ Add player profile'}</button>
      </div>
    </div>
    {showGuestForm && <form className="player-input" onSubmit={e => {
      e.preventDefault();
      if (!canAddGuest) return;
      onChange([...names, guest]);
      setGuestName('');
      setShowGuestForm(false);
    }}>
      <input aria-label="Guest name" autoFocus maxLength={30} placeholder="Guest name" value={guestName} onChange={e => setGuestName(e.target.value)} />
      <button type="submit" className="secondary" disabled={!canAddGuest}>Add</button>
    </form>}
    {adding && <ProfileForm key={editingId ?? 'new'} profile={profiles.find(profile => profile.id === editingId)} profiles={profiles} names={names} onChange={onChange} onSave={setProfiles} onClose={() => {
      setAdding(false);
      setEditingId(null);
    }} busy={busy} setBusy={setBusy} />}
    <p className="muted small">Click a name to add or remove them from the lineup. Profiles and photos stay in this browser.</p>
    <div className="profile-grid">{profiles.map(profile => <div key={profile.id} className="profile-item">
      <ProfileCard name={profile.name} image={profile.image} selected={names.includes(profile.name)} onClick={() => onChange(names.includes(profile.name) ? names.filter(n => n !== profile.name) : [...names, profile.name])} />
      <button type="button" className="secondary" disabled={busy} aria-label={`Edit ${profile.name}`} onClick={() => {
        setEditingId(profile.id);
        setAdding(true);
      }}>Edit</button>
    </div>)}</div>
  </section>;
}
