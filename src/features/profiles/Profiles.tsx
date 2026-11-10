import { useLayoutEffect, useRef, useState } from 'react';
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';
import { loadProfiles, profileStorageKey } from './profileStorage';
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const editingProfile = profiles.find(profile => profile.id === editingId);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalOpen = showGuestForm || adding;
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!modalOpen || !dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [modalOpen]);

  function closeModal() {
    setShowGuestForm(false);
    setGuestName('');
    setAdding(false);
    setEditingId(null);
    setConfirmDelete(false);
    setDeleteError(false);
  }

  function deleteProfile() {
    if (!editingProfile) return;
    const remaining = profiles.filter(profile => profile.id !== editingProfile.id);
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(remaining));
    } catch {
      setDeleteError(true);
      return;
    }
    setProfiles(remaining);
    onChange(names.filter(name => name !== editingProfile.name));
    closeModal();
  }
  const guest = guestName.trim();
  const canAddGuest = guest !== '' && !names.includes(guest);
  return <section className="panel profiles">
    <div className="section-title">
      <h2>Player profiles</h2>
      <div className="profile-actions">
        <button type="button" className="secondary" aria-haspopup="dialog" onClick={() => setShowGuestForm(true)}>+ Add guest</button>
        <button type="button" className="secondary" aria-haspopup="dialog" onClick={() => setAdding(true)}>+ Add player profile</button>
      </div>
    </div>
    <dialog ref={dialogRef} className="panel profile-dialog" aria-labelledby="profile-dialog-title" onCancel={e => {
      e.preventDefault();
      if (!busy) closeModal();
    }}>
      {modalOpen && <>
        <h2 id="profile-dialog-title">{showGuestForm ? 'Add guest' : editingId ? 'Edit profile' : 'Add player profile'}</h2>
        {showGuestForm ? <form className="player-input" onSubmit={e => {
          e.preventDefault();
          if (!canAddGuest) return;
          onChange([...names, guest]);
          closeModal();
        }}>
          <input aria-label="Guest name" autoFocus maxLength={30} placeholder="Guest name" value={guestName} onChange={e => setGuestName(e.target.value)} />
          <button type="submit" className="primary" disabled={!canAddGuest}>Add</button>
        </form> : <div hidden={confirmDelete}><ProfileForm profile={editingProfile} profiles={profiles} names={names} onChange={onChange} onSave={setProfiles} onClose={closeModal} busy={busy} setBusy={setBusy} /></div>}
        {confirmDelete && <p>Delete {editingProfile?.name}’s profile and remove them from the current lineup?</p>}
        {deleteError && <p role="alert" className="notice">Could not delete the profile. Try again.</p>}
        <div className="profile-actions">
          <button type="button" className="secondary" disabled={busy} onClick={() => {
            if (confirmDelete) {
              setConfirmDelete(false);
              setDeleteError(false);
            } else closeModal();
          }}>Cancel</button>
          {editingProfile && <button type="button" className="secondary danger" disabled={busy} onClick={confirmDelete ? deleteProfile : () => setConfirmDelete(true)}>{confirmDelete ? 'Confirm deletion' : 'Delete profile'}</button>}
        </div>
      </>}
    </dialog>
    <p className="muted small">Click a name to add or remove them from the lineup. Profiles and photos stay in this browser.</p>
    <div className="profile-grid">{profiles.map(profile => <div key={profile.id} className="profile-item">
      <ProfileCard name={profile.name} image={profile.image} selected={names.includes(profile.name)} onClick={() => onChange(names.includes(profile.name) ? names.filter(n => n !== profile.name) : [...names, profile.name])} />
      <button type="button" className="profile-edit" disabled={busy} aria-label={`Edit ${profile.name}`} onClick={() => {
        setEditingId(profile.id);
        setAdding(true);
      }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m14 6 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15z" />
        </svg>
      </button>
    </div>)}</div>
  </section>;
}
