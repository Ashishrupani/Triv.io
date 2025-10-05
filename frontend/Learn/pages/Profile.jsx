import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Skeleton.css';
import '../styles/Profile.css';
import {
  getProfile,
  saveProfile,
  ensureProfileFromAuth,
  computeStats,
} from '../src/storage/profileStore';
import { getLocalLeaderboard } from '../src/leaderboard';

const prettyName = (value, user) => {
  const source = value || user?.given_name || user?.nickname || user?.name || user?.email || 'You';
  if (!source) return 'You';
  const trimmed = String(source).trim();
  if (trimmed.includes('@')) {
    const [first] = trimmed.split('@');
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'You';
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export default function Profile() {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout, error } = useAuth0();
  const [profile, setProfile] = useState(() => getProfile());
  const [form, setForm] = useState({ displayName: '', bio: '', location: '' });
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState('');

  // Load + merge auth info
  useEffect(() => {
    const merged = ensureProfileFromAuth(user);
    setProfile(merged);
    setForm({
      displayName: merged.displayName || '',
      bio: merged.bio || '',
      location: merged.location || '',
    });
    setAvatar(merged.avatarDataUrl || user?.picture || '');
  }, [user]);

  const [attemptedLogin, setAttemptedLogin] = useState(false);
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !attemptedLogin) {
      setAttemptedLogin(true);
      if (import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID) {
        loginWithRedirect({ screen_hint: 'login' }).catch(() => {});
      }
    }
  }, [isLoading, isAuthenticated, attemptedLogin, loginWithRedirect]);

  const leaderboardEntries = useMemo(() => getLocalLeaderboard(), [profile.updatedAt]);
  const personalEntries = useMemo(() => {
    const name = profile.displayName || user?.name || 'Guest';
    return leaderboardEntries.filter((entry) => entry.profileEmail === profile.email || entry.name === name);
  }, [leaderboardEntries, profile.displayName, profile.email, user?.name]);

  const stats = useMemo(() => computeStats(personalEntries), [personalEntries]);
  const recentScores = personalEntries.slice(0, 5);
  const headingName = useMemo(() => prettyName(profile.displayName, user), [profile.displayName, user]);

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file');
      return;
    }
    if (file.size > 400 * 1024) {
      alert('Image too large. Please pick something under 400KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setAvatar(dataUrl);
      const updated = saveProfile({ ...form, avatarDataUrl: dataUrl }, user);
      setProfile(updated);
      setStatus('Picture uploaded');
      setTimeout(() => setStatus(''), 1600);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function handleAvatarReset() {
    setAvatar('');
    const updated = saveProfile({ ...form, avatarDataUrl: undefined }, user);
    setProfile(updated);
    setStatus('Avatar removed');
    setTimeout(() => setStatus(''), 1600);
  }

  function handleSave() {
    const updated = saveProfile({ ...form, avatarDataUrl: avatar || profile.avatarDataUrl }, user);
    setProfile(updated);
    setStatus('Profile saved');
    setTimeout(() => setStatus(''), 1600);
  }

  const missingAuthConfig = !import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID;

  const levelProgress = ((profile.xp % 500) / 500) * 100;

  return (
    <div className="profile-page">
      {missingAuthConfig && (
        <div style={{ padding: 12, borderRadius: 12, background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', marginBottom: 18 }}>
          Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your Vite env.
        </div>
      )}

      {error && (
        <div style={{ padding: 12, borderRadius: 12, background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', marginBottom: 18 }}>
          {String(error.message || error)}
        </div>
      )}

      <div className="profile-hero">
        <section className="profile-card">
          <div className="profile-avatar">
            {isLoading ? (
              <div className="skeleton skeleton-avatar" style={{ width: '100%', height: '100%', borderRadius: 24 }} />
            ) : avatar ? (
              <img src={avatar} alt="profile avatar" />
            ) : (
              headingName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="profile-meta">
            <h1>{headingName}</h1>
            <p>{profile.email || user?.email || 'Set your email in your Auth profile'}</p>
            <div className="tagline">
              Level {profile.level || 1} Explorer
            </div>
          </div>
        </section>

        <aside className="profile-level-card">
          <div className="level-row">
            <span className="level-label">Current level</span>
            <span className="level-value">{profile.level || 1}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.max(4, Math.min(levelProgress, 100))}%` }} />
          </div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            {profile.streak ? `🔥 ${profile.streak}-quiz streak` : 'Play quizzes to build your streak!'}
          </div>
        </aside>
      </div>

      <div className="profile-grid">
        <section className="profile-panel">
          <h2>Profile</h2>
          <label>Display name</label>
          <input value={form.displayName} onChange={handleChange('displayName')} placeholder="Pick a username" />

          <label style={{ marginTop: 16 }}>Bio</label>
          <textarea value={form.bio} onChange={handleChange('bio')} placeholder="Tell the community what you are studying." />

          <label style={{ marginTop: 16 }}>Location</label>
          <input value={form.location} onChange={handleChange('location')} placeholder="City, Country" />

          <div className="profile-actions">
            <button type="button" className="profile-button primary" onClick={handleSave}>
              Save profile
            </button>
            <label className="profile-button ghost" style={{ cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              Upload picture
            </label>
            {avatar && (
              <button type="button" className="profile-button ghost" onClick={handleAvatarReset}>
                Remove photo
              </button>
            )}
            {isAuthenticated ? (
              <button
                type="button"
                className="profile-button ghost"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Log out
              </button>
            ) : (
              <button
                type="button"
                className="profile-button ghost"
                onClick={() => loginWithRedirect({ screen_hint: 'login' })}
              >
                Log in
              </button>
            )}
          </div>
          <div style={{ color: '#16a34a', fontSize: 14, minHeight: 18, marginTop: 12 }}>{status || '\u00A0'}</div>
        </section>

        <section className="profile-panel">
          <h2>Stats</h2>
          <div className="stat-grid">
            <div className="stat-card">
              <h3>Total quizzes</h3>
              <p>{stats.totalQuizzes}</p>
            </div>
            <div className="stat-card">
              <h3>Best score</h3>
              <p>
                {stats.bestScore ? `${stats.bestScore}/${stats.bestScoreTotal}` : '--'}
              </p>
            </div>
            <div className="stat-card">
              <h3>Average</h3>
              <p>{stats.averageScore}%</p>
            </div>
            <div className="stat-card">
              <h3>Longest streak</h3>
              <p>{profile.longestStreak || 0}</p>
            </div>
          </div>
          <button
            type="button"
            className="ghost"
            style={{ marginTop: 18 }}
            onClick={() => (window.location.href = '/leaderboard')}
          >
            View full leaderboard
          </button>
        </section>

        <section className="profile-panel">
          <h2>Badges</h2>
          {profile.badges && profile.badges.length > 0 ? (
            <div className="badge-grid">
              {profile.badges.map((badge) => (
                <span key={badge} className="badge-pill">{badge}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', margin: 0 }}>Score perfect quizzes or maintain streaks to earn badges.</p>
          )}
        </section>

        <section className="profile-panel">
          <h2>Recent quizzes</h2>
          {recentScores.length === 0 ? (
            <p style={{ color: '#64748b', margin: 0 }}>Play a quiz to start tracking your history.</p>
          ) : (
            <table className="recent-table">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Difficulty</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentScores.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.score}/{entry.total}</td>
                    <td>{entry.difficulty}</td>
                    <td>{new Date(entry.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
