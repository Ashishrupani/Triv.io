// Simple localStorage-backed leaderboard utilities

const LB_KEY = 'leaderboard_v1';

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LB_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (Array.isArray(data)) return data;
    return [];
  } catch (e) {
    console.error('Failed to read leaderboard', e);
    return [];
  }
}

export function addScore(entry) {
  // entry: { name: string, score: number, total?: number, date?: string }
  const now = new Date().toISOString();
  const clean = {
    name: String(entry?.name || 'Guest').slice(0, 60),
    score: Number.isFinite(entry?.score) ? Number(entry.score) : 0,
    total: Number.isFinite(entry?.total) ? Number(entry.total) : undefined,
    date: entry?.date || now,
  };

  const cur = getLeaderboard();
  const next = [...cur, clean]
    .filter(x => Number.isFinite(x.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100); // keep top 100

  localStorage.setItem(LB_KEY, JSON.stringify(next));
  return next;
}

export function clearLeaderboard() {
  localStorage.removeItem(LB_KEY);
}

