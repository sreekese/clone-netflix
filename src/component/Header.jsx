import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logo from '../assets/Netflix_Logo_PMS.png';
import { auth } from '../utlis/firebase';
import ProfileIcon from './ProfileIcon';

export default function Header({ overlay = false }) {
  const [open, setOpen] = useState(false);
  const accountRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
      if (!accountRef.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);
  const user = useSelector((state) => state.user);
  const notice = useSelector((state) => state.session.notice);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function handleSignOut() {
    setBusy(true);
    setError('');
    try {
      await signOut(auth);
    } catch {
      setError('Unable to sign out. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <header className={`site-header${overlay ? ' header-overlay' : ''}`}>
      <Link to="/" aria-label="Netflix home">
        <img className="logo" src={logo} alt="Netflix" />
      </Link>
      <nav aria-label="Account">
        {user ? (
          <div
            className="account-controls"
            ref={accountRef}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setOpen(false);
            }}
          >
            <button
              ref={triggerRef}
              className="avatar-button"
              aria-label="Open profile menu"
              aria-expanded={open}
              aria-controls="profile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="profile-avatar" aria-hidden="true">
                {user.displayName?.trim().slice(0, 1).toUpperCase() || (
                  <ProfileIcon />
                )}
              </span>
            </button>
            {open && (
              <div id="profile-menu" className="profile-menu">
                <p>{user.displayName || 'Your profile'}</p>
                <Link to="/profile" onClick={() => setOpen(false)}>
                  <ProfileIcon /> My profile
                </Link>
                <button onClick={handleSignOut} disabled={busy}>
                  <ProfileIcon kind="logout" />
                  {busy ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link className="button" to="/login">
            Sign in
          </Link>
        )}
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
      </nav>
    </header>
  );
}
