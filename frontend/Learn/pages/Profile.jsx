import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Skeleton.css';

const PROFILE_KEY = 'profile_v1';

export default function Profile() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout, error } = useAuth0();
  const [displayName, setDisplayName] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      const data = raw ? JSON.parse(raw) : {};
      setDisplayName(data.displayName || user?.name || 'Guest');
    } catch {
      setDisplayName(user?.name || 'Guest');
    }
  }, [user]);

  const [attemptedLogin, setAttemptedLogin] = useState(false);
  useEffect(() => {
    // Auto-prompt login when visiting Profile if not authenticated
    if (!isLoading && !isAuthenticated && !attemptedLogin) {
      setAttemptedLogin(true);
      if (import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID) {
        loginWithRedirect({ screen_hint: 'login' }).catch(() => {});
      }
    }
  }, [isLoading, isAuthenticated, attemptedLogin, loginWithRedirect]);

  function saveProfile() {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ displayName }));
    setSaved('Saved');
    setTimeout(() => setSaved(''), 1200);
  }

  const missingAuthConfig = !import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID;

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: 8 }}>Profile</h1>
      <p style={{ color: '#555', marginTop: 0 }}>Manage your basic info.</p>

      {missingAuthConfig && (
        <div style={{ padding: 12, borderRadius: 8, background: '#fff3cd', border: '1px solid #ffe69c', color: '#664d03', margin: '12px 0' }}>
          Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your env.
        </div>
      )}

      {error && (
        <div style={{ padding: 12, borderRadius: 8, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', margin: '12px 0' }}>
          {String(error.message || error)}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
          <div className="skeleton skeleton-avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text lg" style={{ width: '40%' }} />
            <div className="skeleton skeleton-text" style={{ width: '26%', marginTop: 8 }} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
          {user?.picture ? (
            <img src={user.picture} alt="avatar" width={64} height={64} style={{ borderRadius: '50%' }} />
          ) : (
            <div className="skeleton skeleton-avatar" />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{user?.email || 'Not logged in'}</div>
            {isAuthenticated ? (
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                style={{ marginTop: 8 }}
              >
                Log out
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => loginWithRedirect({ screen_hint: 'login' })}>Log in</button>
                <button onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>Sign up</button>
              </div>
            )}
          </div>
        </div>
      )}

      <label style={{ display: 'block', marginTop: 16 }}>Display name</label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name as shown on leaderboards"
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
      />
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={saveProfile}>Save</button>
        <span style={{ color: '#16a34a' }}>{saved || '\u00A0'}</span>
      </div>

      {/* Skeleton section for upcoming profile details */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent Activity</h2>
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 12, marginTop: 12 }} />
      </div>
    </div>
  );
}
