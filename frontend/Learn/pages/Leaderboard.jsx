import React, { useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  getLeaderboard,
  clearLeaderboard,
  getLeaderboardSettings,
  setLeaderboardSettings,
} from '../src/leaderboard';
import { getProfile } from '../src/storage/profileStore';
import '../styles/Skeleton.css';
import '../styles/Leaderboard.css';

const difficultyOptions = [
  { value: 'all', label: 'All difficulties' },
  { value: 'Easy', label: 'Easy' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Hard', label: 'Hard' },
];

const friendlyName = (value, user) => {
  const base = value || user?.given_name || user?.nickname || user?.name || user?.email || 'You';
  const trimmed = String(base).trim();
  if (trimmed.includes('@')) {
    const [first] = trimmed.split('@');
    return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'You';
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export default function Leaderboard() {
  const { user } = useAuth0();
  const settings = useMemo(() => getLeaderboardSettings(), []);
  const [scope, setScope] = useState(settings.scope || 'local');
  const [difficulty, setDifficulty] = useState('all');
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  const profile = useMemo(() => getProfile(user), [user, version]);
  const profileName = useMemo(() => friendlyName(profile.displayName, user), [profile.displayName, user]);

  const entries = useMemo(() => {
    const base = getLeaderboard({ scope });
    const filtered = difficulty === 'all' ? base : base.filter((row) => row.difficulty === difficulty);
    if (scope === 'local') {
      return filtered
        .slice()
        .sort((a, b) => (b.score / (b.total || 1)) - (a.score / (a.total || 1)));
    }
    return filtered;
  }, [scope, difficulty, version]);

  const topThree = entries.slice(0, 3);
  const remainder = entries.slice(3);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, [scope, difficulty, version]);

  function changeScope(nextScope) {
    setScope(nextScope);
    setLeaderboardSettings({ scope: nextScope });
    setLoading(true);
    setVersion((v) => v + 1);
  }

  function handleClear() {
    if (scope !== 'local') return;
    if (confirm('Clear your local leaderboard scores?')) {
      clearLeaderboard();
      setVersion((v) => v + 1);
    }
  }

  return (
    <div className="leaderboard-page">
      <div className="lb-header">
        <div>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-headline">
            Track your best scores and see how you stack up against the community.
          </p>
        </div>
        <div className="tab-group">
          <button
            className={`tab-button ${scope === 'local' ? 'active' : ''}`}
            onClick={() => changeScope('local')}
            type="button"
          >
            My device
          </button>
          <button
            className={`tab-button ${scope === 'global' ? 'active' : ''}`}
            onClick={() => changeScope('global')}
            type="button"
          >
            Global
          </button>
        </div>
      </div>

      <div className="lb-grid">
        <section className="lb-card">
          <h2>{scope === 'local' ? 'Top players (local)' : 'Top players (global)'}</h2>

          <div className="filter-bar">
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              disabled={scope === 'global'}
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {scope === 'local' && (
              <button type="button" className="clear-btn" onClick={handleClear}>
                Clear local scores
              </button>
            )}
          </div>

          {loading ? (
            <div>
              <div className="skeleton" style={{ height: 60, borderRadius: 16, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 60, borderRadius: 16, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 60, borderRadius: 16 }} />
            </div>
          ) : entries.length === 0 ? (
            <p style={{ color: '#64748b', margin: '16px 0 0' }}>
              No scores yet. Play a quiz and save your score to populate this leaderboard.
            </p>
          ) : (
            <>
              <div className="top-three">
                {topThree.map((entry, index) => (
                  <div key={entry.id || `${entry.name}-${entry.date}`} className="top-entry">
                    <div className="top-rank">#{index + 1}</div>
                    <div className="top-details">
                      <strong>{entry.name}</strong>
                      <span style={{ color: '#475569', fontSize: 13 }}>
                        {entry.score}/{entry.total} • {entry.difficulty || 'Unknown'}
                      </span>
                    </div>
                    <span className="badge-chip">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>

              {remainder.length > 0 && (
                <div className="lb-table-wrapper">
                  <table className="lb-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Score</th>
                        <th>Difficulty</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remainder.map((entry, idx) => (
                        <tr key={entry.id || `${entry.name}-${entry.date}`}>
                          <td>{idx + 4}</td>
                          <td>{entry.name}</td>
                          <td>{entry.score}/{entry.total || '?'}</td>
                          <td>{entry.difficulty || '—'}</td>
                          <td>{new Date(entry.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="lb-card">
          <h2>Your progress</h2>
          <div className="player-highlight">
            {profile.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt="profile avatar" />
            ) : user?.picture ? (
              <img src={user.picture} alt="profile avatar" />
            ) : (
              <div className="player-placeholder">{profileName.slice(0, 1).toUpperCase()}</div>
            )}
            <div>
              <strong>{profileName}</strong>
              <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 14 }}>
                Level {profile.level || 1} • {profile.totalQuizzes || 0} quizzes played
              </p>
              <p style={{ margin: '4px 0 0', color: '#6366f1', fontWeight: 600, fontSize: 13 }}>
                {profile.streak ? `🔥 ${profile.streak}-quiz streak` : 'Start a streak by acing your next quiz'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>Total badges</span>
              <strong>{profile.badges?.length || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span>Top score</span>
              <strong>
                {entries.length ? `${entries[0].score}/${entries[0].total}` : '--'}
              </strong>
            </div>
            <button
              type="button"
              className="ghost"
              style={{ marginTop: 12 }}
              onClick={() => (window.location.href = '/profile')}
            >
              Edit profile
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
