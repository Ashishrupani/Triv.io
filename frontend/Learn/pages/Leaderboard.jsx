import React, { useEffect, useMemo, useState } from 'react';
import { getLeaderboard, clearLeaderboard } from '../src/leaderboard';
import '../styles/Skeleton.css';

export default function Leaderboard() {
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const entries = useMemo(() => getLeaderboard(), [version]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  function handleClear() {
    if (confirm('Clear leaderboard?')) {
      clearLeaderboard();
      setVersion(v => v + 1);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 20, fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>Leaderboard</h1>
        <button onClick={handleClear} title="Clear all scores">Clear</button>
      </div>
      <p style={{ color: '#555', marginTop: 0 }}>Top scores on this device.</p>

      {loading ? (
        <div>
          <div className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 8 }} />
        </div>
      ) : entries.length === 0 ? (
        <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 8 }}>No scores yet. Play a quiz and save your score!</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '8px 6px' }}>#</th>
              <th style={{ padding: '8px 6px' }}>Name</th>
              <th style={{ padding: '8px 6px' }}>Score</th>
              <th style={{ padding: '8px 6px' }}>When</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 6px', width: 40 }}>{i + 1}</td>
                <td style={{ padding: '10px 6px' }}>{e.name || 'Guest'}</td>
                <td style={{ padding: '10px 6px' }}>
                  {e.total ? `${e.score}/${e.total}` : e.score}
                </td>
                <td style={{ padding: '10px 6px', color: '#555' }}>
                  {e.date ? new Date(e.date).toLocaleString() : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
