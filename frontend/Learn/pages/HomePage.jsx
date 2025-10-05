import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/HomePage.css';
import { getProfile } from '../src/storage/profileStore';
import { getLeaderboard } from '../src/leaderboard';

const friendlyName = (name, user) => {
  const candidate = name || user?.given_name || user?.nickname || user?.name || user?.email || 'Learner';
  if (!candidate) return 'Learner';
  const trimmed = String(candidate).trim();
  if (trimmed.includes('@')) {
    const [first] = trimmed.split('@');
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'Learner';
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

function HomePage() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [profile, setProfile] = useState(() => getProfile());
  const [localTop, setLocalTop] = useState(() => getLeaderboard({ scope: 'local' }).slice(0, 5));

  useEffect(() => {
    setProfile(getProfile(user));
    setLocalTop(getLeaderboard({ scope: 'local' }).slice(0, 5));
  }, [user]);

  const xpProgress = useMemo(() => {
    const xp = profile.xp || 0;
    return ((xp % 500) / 500) * 100;
  }, [profile.xp]);

  const badgesToShow = (profile.badges || []).slice(0, 3);
  const greetingName = useMemo(() => friendlyName(profile.displayName, user), [profile.displayName, user]);

  return (
    <div className="homepage-wrapper">
      <div className="background-overlay" />

      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-logo">triv.io</div>
            <nav className="navbar-nav">
              <a href="/quiz" className="nav-link">Quiz</a>
              <a href="/leaderboard" className="nav-link">Leaderboard</a>
              <a href="/profile" className="nav-link">Profile</a>
              {isAuthenticated ? (
                <a href="/profile" className="nav-profile">
                  {profile.avatarDataUrl ? (
                    <img src={profile.avatarDataUrl} alt="avatar" />
                  ) : user?.picture ? (
                    <img src={user.picture} alt="avatar" />
                  ) : (
                    <span className="avatar-fallback">{greetingName.slice(0, 1).toUpperCase()}</span>
                  )}
                  <span>{greetingName}</span>
                </a>
              ) : (
                <button
                  type="button"
                  className="nav-profile"
                  onClick={() => loginWithRedirect({ screen_hint: 'login' })}
                  style={{ border: 'none' }}
                >
                  <span className="avatar-fallback">?</span>
                  <span>Log in</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero-card">
          <div className="hero-text">
            <h1>Welcome back, {greetingName}!</h1>
            <p>
              Build your knowledge streak, climb the leaderboard, and keep your notes sharp. Start a quick
              practice quiz or review your highlights below.
            </p>
            <div className="badge-cluster">
              {badgesToShow.length > 0 ? (
                badgesToShow.map((badge) => (
                  <span key={badge} className="badge-pill">{badge}</span>
                ))
              ) : (
                <span style={{ color: '#cbd5f5', fontSize: 14 }}>Earn badges by completing quizzes!</span>
              )}
            </div>
          </div>

          <div className="xp-summary">
            <div className="label">
              <span>Level {profile.level || 1}</span>
              <span>{profile.xp || 0} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${Math.max(6, Math.min(100, xpProgress || 0))}%` }} />
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              {profile.streak ? `🔥 On a ${profile.streak}-quiz streak` : 'Ace quizzes consecutively to start a streak!'}
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h2>Snapshot</h2>
            <div className="quick-metrics">
              <div className="metric-row">
                <span>Total quizzes</span>
                <strong>{profile.totalQuizzes || 0}</strong>
              </div>
              <div className="metric-row">
                <span>Longest streak</span>
                <strong>{profile.longestStreak || 0}</strong>
              </div>
              <div className="metric-row">
                <span>Badges earned</span>
                <strong>{profile.badges?.length || 0}</strong>
              </div>
            </div>
            <div className="quick-links">
              <a href="/quiz">Take a quiz</a>
              <a href="/create-quiz">Create notes</a>
            </div>
          </section>

          <section className="dashboard-card leaderboard-preview">
            <h2>Leaderboard preview</h2>
            {localTop.length === 0 ? (
              <p style={{ color: '#cbd5f5', margin: 0 }}>Play and save a quiz score to see your ranking.</p>
            ) : (
              <ul>
                {localTop.map((entry, index) => (
                  <li key={entry.id || `${entry.name}-${entry.date}`}>
                    <span className="name">#{index + 1} {entry.name}</span>
                    <span className="score">{entry.score}/{entry.total}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="quick-links" style={{ marginTop: 16 }}>
              <a href="/leaderboard">See all</a>
            </div>
          </section>

          <section className="dashboard-card challenge-card">
            <h2>Daily challenge</h2>
            <p style={{ color: '#cbd5f5', margin: 0 }}>
              Set a personal record by scoring above {localTop[0] ? Math.min(localTop[0].score + 1, localTop[0].total) : 8}
              {' '}on your next quiz. Keep your streak alive!
            </p>
            <button type="button" onClick={() => (window.location.href = '/quiz')}>
              Start practice quiz
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
