import { getProfile, recordPlay } from './profileStore';

const LOCAL_KEY = 'leaderboard_local_v2';
const SETTINGS_KEY = 'leaderboard_settings_v1';

const GLOBAL_SEED = [
  {
    id: 'global-1',
    name: 'Avery Chen',
    score: 19,
    total: 20,
    date: '2024-09-02T14:32:00Z',
    avatar: 'https://i.pravatar.cc/120?img=12',
    location: 'Seattle, USA',
    difficulty: 'Hard',
  },
  {
    id: 'global-2',
    name: 'Priya Sharma',
    score: 18,
    total: 20,
    date: '2024-09-04T10:14:00Z',
    avatar: 'https://i.pravatar.cc/120?img=32',
    location: 'Mumbai, India',
    difficulty: 'Hard',
  },
  {
    id: 'global-3',
    name: 'Luis Martínez',
    score: 17,
    total: 20,
    date: '2024-09-08T17:54:00Z',
    avatar: 'https://i.pravatar.cc/120?img=45',
    location: 'Madrid, Spain',
    difficulty: 'Medium',
  },
  {
    id: 'global-4',
    name: 'Naomi West',
    score: 16,
    total: 20,
    date: '2024-09-09T19:21:00Z',
    avatar: 'https://i.pravatar.cc/120?img=5',
    location: 'Austin, USA',
    difficulty: 'Medium',
  },
  {
    id: 'global-5',
    name: 'Omar Farouk',
    score: 15,
    total: 20,
    date: '2024-09-11T09:44:00Z',
    avatar: 'https://i.pravatar.cc/120?img=24',
    location: 'Dubai, UAE',
    difficulty: 'Medium',
  },
];

export function getLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Unable to parse local leaderboard', err);
    return [];
  }
}

export function saveLocalLeaderboard(entries) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
}

export function getGlobalLeaderboard() {
  return [...GLOBAL_SEED];
}

export function getLeaderboard({ scope = 'local' } = {}) {
  if (scope === 'global') return getGlobalLeaderboard();
  return getLocalLeaderboard();
}

export function addScore({
  name,
  score,
  total,
  difficulty = 'Medium',
  durationSeconds,
}, user) {
  const now = new Date().toISOString();
  const profile = getProfile(user);
  const clean = {
    id: `local-${now}`,
    name: String(name || profile.displayName || 'Guest').slice(0, 60),
    score: Number.isFinite(score) ? Number(score) : 0,
    total: Number.isFinite(total) ? Number(total) : 0,
    difficulty,
    durationSeconds: Number.isFinite(durationSeconds) ? Number(durationSeconds) : undefined,
    date: now,
    profileEmail: profile.email || user?.email,
    avatar: profile.avatarDataUrl || user?.picture || undefined,
  };

  const existing = getLocalLeaderboard();
  const next = [...existing, clean]
    .filter((row) => Number.isFinite(row.score))
    .sort((a, b) => (b.score / (b.total || 1)) - (a.score / (a.total || 1)))
    .slice(0, 100);

  saveLocalLeaderboard(next);

  try {
    recordPlay({ score: clean.score, total: clean.total, streakEarned: clean.score === clean.total }, user);
  } catch (err) {
    console.warn('Failed to update profile from score', err);
  }

  return next;
}

export function clearLocalLeaderboard() {
  localStorage.removeItem(LOCAL_KEY);
}

export function setLeaderboardSettings(settings = {}) {
  const current = getLeaderboardSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

export function getLeaderboardSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { scope: 'local' };
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : { scope: 'local' };
  } catch (err) {
    console.error('Failed to read leaderboard settings', err);
    return { scope: 'local' };
  }
}

export function summarizePlayer(name) {
  const entries = getLocalLeaderboard().filter((row) => row.name === name);
  return {
    totalGames: entries.length,
    bestScore: entries.reduce((max, row) => Math.max(max, row.score), 0),
    averageScore:
      entries.length === 0
        ? 0
        : Math.round(
            entries.reduce((acc, row) => acc + (row.total > 0 ? (row.score / row.total) * 100 : 0), 0) /
              entries.length
          ),
  };
}
