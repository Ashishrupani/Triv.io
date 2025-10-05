const PROFILE_KEY = 'profile_v2';

function deriveDisplayName(user) {
  const candidates = [
    user?.given_name,
    user?.nickname,
    user?.name,
    user?.email ? user.email.split('@')[0] : undefined,
  ].filter(Boolean);

  const chosen = candidates.find((value) => value && !String(value).includes('@')) || candidates[0];
  if (!chosen) return 'Guest';

  const name = String(chosen).trim();
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const defaultProfile = (user) => {
  const now = new Date().toISOString();
  return {
    displayName: deriveDisplayName(user),
    email: user?.email || '',
    bio: '',
    location: '',
    avatarDataUrl: user?.picture || '',
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    totalQuizzes: 0,
    lastPlayedAt: null,
    joinDate: now,
    updatedAt: now,
    badges: [],
  };
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function getProfile(user) {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      const base = defaultProfile(user);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(base));
      return base;
    }
    const data = JSON.parse(raw);
    return {
      ...defaultProfile(user),
      ...data,
    };
  } catch (err) {
    console.error('Failed to parse profile', err);
    const base = defaultProfile(user);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(base));
    return base;
  }
}

export function saveProfile(updates = {}, user) {
  const current = getProfile(user);
  const now = new Date().toISOString();
  const next = {
    ...current,
    ...safeUpdates(updates),
    updatedAt: now,
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export function ensureProfileFromAuth(user) {
  if (!user) return getProfile();
  const current = getProfile(user);
  const updates = {};
  if (user.email && current.email !== user.email) updates.email = user.email;
  if (!current.displayName || current.displayName.includes('@')) {
    const derived = deriveDisplayName(user);
    if (derived) updates.displayName = derived;
  }
  if (!current.avatarDataUrl && user.picture) updates.avatarDataUrl = user.picture;
  if (Object.keys(updates).length) {
    return saveProfile(updates, user);
  }
  return current;
}

export function recordPlay({ score = 0, total = 0, streakEarned = false }, user) {
  const current = getProfile(user);
  const now = new Date().toISOString();
  const accuracy = total > 0 ? score / total : 0;
  const gainedXp = Math.round(accuracy * 120 + (streakEarned ? 20 : 0));
  const newXp = (current.xp || 0) + gainedXp;
  const level = Math.max(1, Math.floor(newXp / 500) + 1);

  const streak = streakEarned ? (current.streak || 0) + 1 : 0;
  const longestStreak = Math.max(current.longestStreak || 0, streak);

  const badges = new Set(current.badges || []);
  if (total > 0) {
    if (score === total && total >= 5) badges.add('Perfect Score');
    if (accuracy >= 0.9 && total >= 10) badges.add('Quiz Whisperer');
    if ((current.totalQuizzes || 0) + 1 >= 10) badges.add('Quiz Veteran');
  }

  const totalQuizzes = (current.totalQuizzes || 0) + 1;

  const next = {
    ...current,
    xp: newXp,
    level,
    streak,
    longestStreak,
    lastPlayedAt: now,
    totalQuizzes,
    badges: Array.from(badges),
    updatedAt: now,
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function awardBadge(badge) {
  if (!badge) return getProfile();
  const current = getProfile();
  const badges = new Set(current.badges || []);
  badges.add(String(badge));
  return saveProfile({ badges: Array.from(badges) });
}

export function computeStats(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      bestScorePercent: 0,
    };
  }
  const totals = entries.reduce(
    (acc, item) => {
      const score = Number(item.score) || 0;
      const total = Number(item.total) || 0;
      acc.totalQuizzes += 1;
      acc.scoreSum += score;
      acc.totalSum += total;
      const pct = total > 0 ? (score / total) * 100 : 0;
      if (pct > acc.bestScorePercent) {
        acc.bestScore = score;
        acc.bestScoreTotal = total;
        acc.bestScorePercent = pct;
      }
      return acc;
    },
    { totalQuizzes: 0, scoreSum: 0, totalSum: 0, bestScore: 0, bestScoreTotal: 0, bestScorePercent: 0 }
  );
  const averageScore = totals.totalSum > 0 ? Math.round((totals.scoreSum / totals.totalSum) * 100) : 0;
  return {
    totalQuizzes: totals.totalQuizzes,
    averageScore,
    bestScore: totals.bestScore,
    bestScoreTotal: totals.bestScoreTotal,
    bestScorePercent: Math.round(totals.bestScorePercent),
  };
}

function safeUpdates(data) {
  const out = { ...data };
  if (typeof out.displayName === 'string') {
    out.displayName = out.displayName.trim().slice(0, 40);
  }
  if (typeof out.bio === 'string') {
    out.bio = out.bio.trim().slice(0, 280);
  }
  if (typeof out.location === 'string') {
    out.location = out.location.trim().slice(0, 60);
  }
  if (typeof out.email === 'string') {
    out.email = out.email.trim().slice(0, 120);
  }
  if (out.badges && Array.isArray(out.badges)) {
    out.badges = out.badges.map(String).slice(0, 20);
  }
  if (typeof out.avatarDataUrl !== 'string') {
    delete out.avatarDataUrl;
  }
  if (typeof out.xp === 'number') {
    out.xp = clamp(out.xp, 0, 1_000_000);
  }
  if (typeof out.level === 'number') {
    out.level = clamp(out.level, 1, 999);
  }
  return out;
}
