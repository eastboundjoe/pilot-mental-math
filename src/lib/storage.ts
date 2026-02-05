import { ProblemCategory, ProblemResult, SessionStats } from './problems/types';

// Re-export for convenience
export type { SessionStats } from './problems/types';

const STORAGE_KEYS = {
  SESSIONS: 'pilot-math-sessions',
  RESULTS: 'pilot-math-results',
  STREAK: 'pilot-math-streak',
  LAST_PRACTICE: 'pilot-math-last-practice',
} as const;

// ============================================
// SESSION MANAGEMENT
// ============================================

export function saveSession(session: SessionStats): void {
  const sessions = getSessions();
  sessions.push(session);
  // Keep only last 100 sessions
  if (sessions.length > 100) {
    sessions.shift();
  }
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getSessions(): SessionStats[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getRecentSessions(count: number = 10): SessionStats[] {
  return getSessions().slice(-count);
}

// ============================================
// PROBLEM RESULTS
// ============================================

export function saveResult(result: ProblemResult): void {
  const results = getResults();
  results.push(result);
  // Keep only last 1000 results
  if (results.length > 1000) {
    results.shift();
  }
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

export function getResults(): ProblemResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// ============================================
// STATISTICS
// ============================================

export function getCategoryStats(): Record<ProblemCategory, { attempted: number; correct: number; avgTime: number }> {
  const results = getResults();
  const stats: Record<string, { attempted: number; correct: number; totalTime: number }> = {};

  for (const result of results) {
    if (!stats[result.category]) {
      stats[result.category] = { attempted: 0, correct: 0, totalTime: 0 };
    }
    stats[result.category].attempted++;
    if (result.isCorrect) {
      stats[result.category].correct++;
    }
    stats[result.category].totalTime += result.timeSpent;
  }

  const output: Record<string, { attempted: number; correct: number; avgTime: number }> = {};
  for (const [category, data] of Object.entries(stats)) {
    output[category] = {
      attempted: data.attempted,
      correct: data.correct,
      avgTime: data.attempted > 0 ? Math.round(data.totalTime / data.attempted) : 0,
    };
  }

  return output as Record<ProblemCategory, { attempted: number; correct: number; avgTime: number }>;
}

export function getOverallStats(): { totalProblems: number; totalCorrect: number; accuracy: number; avgTime: number } {
  const results = getResults();
  if (results.length === 0) {
    return { totalProblems: 0, totalCorrect: 0, accuracy: 0, avgTime: 0 };
  }

  const totalProblems = results.length;
  const totalCorrect = results.filter(r => r.isCorrect).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

  return {
    totalProblems,
    totalCorrect,
    accuracy: Math.round((totalCorrect / totalProblems) * 100),
    avgTime: Math.round(totalTime / totalProblems),
  };
}

export function getWeakCategories(limit: number = 5): ProblemCategory[] {
  const stats = getCategoryStats();
  const categories = Object.entries(stats)
    .filter(([, data]) => data.attempted >= 5) // Only consider categories with enough data
    .map(([category, data]) => ({
      category: category as ProblemCategory,
      accuracy: data.correct / data.attempted,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit)
    .map(item => item.category);

  return categories;
}

// ============================================
// STREAK TRACKING
// ============================================

export function updateStreak(): number {
  const today = new Date().toDateString();
  const lastPractice = localStorage.getItem(STORAGE_KEYS.LAST_PRACTICE);
  let streak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0');

  if (!lastPractice) {
    // First time practicing
    streak = 1;
  } else if (lastPractice === today) {
    // Already practiced today, streak unchanged
  } else {
    const lastDate = new Date(lastPractice);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day - increment streak
      streak++;
    } else if (diffDays > 1) {
      // Streak broken - reset
      streak = 1;
    }
  }

  localStorage.setItem(STORAGE_KEYS.STREAK, streak.toString());
  localStorage.setItem(STORAGE_KEYS.LAST_PRACTICE, today);

  return streak;
}

export function getStreak(): number {
  return parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0');
}

// ============================================
// DATA MANAGEMENT
// ============================================

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.RESULTS);
  localStorage.removeItem(STORAGE_KEYS.STREAK);
  localStorage.removeItem(STORAGE_KEYS.LAST_PRACTICE);
}

export function exportData(): string {
  return JSON.stringify({
    sessions: getSessions(),
    results: getResults(),
    streak: getStreak(),
    lastPractice: localStorage.getItem(STORAGE_KEYS.LAST_PRACTICE),
    exportedAt: new Date().toISOString(),
  });
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.sessions) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    }
    if (data.results) {
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(data.results));
    }
    if (data.streak) {
      localStorage.setItem(STORAGE_KEYS.STREAK, data.streak.toString());
    }
    if (data.lastPractice) {
      localStorage.setItem(STORAGE_KEYS.LAST_PRACTICE, data.lastPractice);
    }
    return true;
  } catch {
    return false;
  }
}
