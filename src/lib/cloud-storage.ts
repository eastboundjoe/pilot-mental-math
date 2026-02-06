import { getSupabase } from './supabase';
import { ProblemCategory, ProblemResult, SessionStats } from './problems/types';

// ============================================
// CLOUD STORAGE - SESSIONS
// ============================================

export async function saveSessionToCloud(userId: string, session: SessionStats): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('sessions').insert({
    user_id: userId,
    date: session.date,
    duration: session.duration,
    problems_attempted: session.problemsAttempted,
    problems_correct: session.problemsCorrect,
    accuracy: session.accuracy,
    average_time: session.averageTime,
    category_breakdown: session.categoryBreakdown,
  });

  if (error) {
    console.error('Error saving session to cloud:', error);
    throw error;
  }
}

export async function getSessionsFromCloud(userId: string): Promise<SessionStats[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching sessions from cloud:', error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    date: row.date,
    duration: row.duration,
    problemsAttempted: row.problems_attempted,
    problemsCorrect: row.problems_correct,
    accuracy: row.accuracy,
    averageTime: row.average_time,
    categoryBreakdown: row.category_breakdown as Record<ProblemCategory, { attempted: number; correct: number }>,
  }));
}

// ============================================
// CLOUD STORAGE - RESULTS
// ============================================

export async function saveResultToCloud(userId: string, result: ProblemResult): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('results').insert({
    user_id: userId,
    problem_id: result.problemId,
    category: result.category,
    user_answer: result.userAnswer,
    correct_answer: result.correctAnswer,
    is_correct: result.isCorrect,
    time_spent: result.timeSpent,
    timestamp: result.timestamp,
  });

  if (error) {
    console.error('Error saving result to cloud:', error);
    throw error;
  }
}

export async function saveResultsBatchToCloud(userId: string, results: ProblemResult[]): Promise<void> {
  const supabase = getSupabase();

  const rows = results.map((result) => ({
    user_id: userId,
    problem_id: result.problemId,
    category: result.category,
    user_answer: result.userAnswer,
    correct_answer: result.correctAnswer,
    is_correct: result.isCorrect,
    time_spent: result.timeSpent,
    timestamp: result.timestamp,
  }));

  const { error } = await supabase.from('results').insert(rows);

  if (error) {
    console.error('Error saving results batch to cloud:', error);
    throw error;
  }
}

export async function getResultsFromCloud(userId: string): Promise<ProblemResult[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Error fetching results from cloud:', error);
    return [];
  }

  return (data || []).map((row) => ({
    problemId: row.problem_id,
    category: row.category as ProblemCategory,
    userAnswer: row.user_answer,
    correctAnswer: row.correct_answer,
    isCorrect: row.is_correct,
    timeSpent: row.time_spent,
    timestamp: row.timestamp,
  }));
}

// ============================================
// CLOUD STORAGE - STREAKS
// ============================================

export async function getStreakFromCloud(userId: string): Promise<{ currentStreak: number; lastPracticeDate: string | null }> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak, last_practice_date')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching streak from cloud:', error);
    return { currentStreak: 0, lastPracticeDate: null };
  }

  return {
    currentStreak: data?.current_streak || 0,
    lastPracticeDate: data?.last_practice_date || null,
  };
}

export async function updateStreakInCloud(userId: string): Promise<number> {
  const supabase = getSupabase();

  // Get current streak data
  const { currentStreak, lastPracticeDate } = await getStreakFromCloud(userId);

  const today = new Date().toISOString().split('T')[0];
  let newStreak = currentStreak;

  if (!lastPracticeDate) {
    newStreak = 1;
  } else if (lastPracticeDate === today) {
    // Already practiced today
  } else {
    const lastDate = new Date(lastPracticeDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = currentStreak + 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  // Update streak in database
  const { error } = await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      last_practice_date: today,
      longest_streak: Math.max(newStreak, currentStreak),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating streak in cloud:', error);
  }

  return newStreak;
}

// ============================================
// DATA MIGRATION (localStorage -> Cloud)
// ============================================

export async function migrateLocalDataToCloud(userId: string): Promise<{ sessions: number; results: number }> {
  // Import local storage functions
  const localSessions = JSON.parse(localStorage.getItem('pilot-math-sessions') || '[]');
  const localResults = JSON.parse(localStorage.getItem('pilot-math-results') || '[]');

  let migratedSessions = 0;
  let migratedResults = 0;

  // Migrate sessions
  if (localSessions.length > 0) {
    const supabase = getSupabase();

    const sessionRows = localSessions.map((session: SessionStats) => ({
      user_id: userId,
      date: session.date,
      duration: session.duration,
      problems_attempted: session.problemsAttempted,
      problems_correct: session.problemsCorrect,
      accuracy: session.accuracy,
      average_time: session.averageTime,
      category_breakdown: session.categoryBreakdown,
    }));

    const { error } = await supabase.from('sessions').insert(sessionRows);
    if (!error) {
      migratedSessions = sessionRows.length;
    }
  }

  // Migrate results
  if (localResults.length > 0) {
    const supabase = getSupabase();

    const resultRows = localResults.map((result: ProblemResult) => ({
      user_id: userId,
      problem_id: result.problemId,
      category: result.category,
      user_answer: result.userAnswer,
      correct_answer: result.correctAnswer,
      is_correct: result.isCorrect,
      time_spent: result.timeSpent,
      timestamp: result.timestamp,
    }));

    // Insert in batches of 100 to avoid timeouts
    for (let i = 0; i < resultRows.length; i += 100) {
      const batch = resultRows.slice(i, i + 100);
      const { error } = await supabase.from('results').insert(batch);
      if (!error) {
        migratedResults += batch.length;
      }
    }
  }

  // Clear local storage after successful migration
  if (migratedSessions > 0 || migratedResults > 0) {
    localStorage.removeItem('pilot-math-sessions');
    localStorage.removeItem('pilot-math-results');
    localStorage.removeItem('pilot-math-streak');
    localStorage.removeItem('pilot-math-last-practice');
  }

  return { sessions: migratedSessions, results: migratedResults };
}
