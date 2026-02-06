'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { HeatmapCalendar } from '@/components/heatmap-calendar';
import { TimingBreakdown } from '@/components/timing-breakdown';
import { MissedProblems } from '@/components/missed-problems';
import { AuthModal } from '@/components/auth-modal';
import { useAuth } from '@/components/auth-provider';
import {
  getOverallStats,
  getCategoryStats,
  getStreak,
  getRecentSessions,
  getCategoryTimingStats,
  getPracticeCalendar,
  getTotalDaysPracticed,
  getWeakCategories,
  getMissedByCategory,
  CalendarDay,
  CategoryTimingStats,
} from '@/lib/storage';
import {
  getSessionsFromCloud,
  getResultsFromCloud,
  getStreakFromCloud,
  migrateLocalDataToCloud,
} from '@/lib/cloud-storage';
import { CATEGORY_INFO, ProblemCategory, SessionStats, ProblemResult } from '@/lib/problems';

export default function HomePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalProblems: 0, totalCorrect: 0, accuracy: 0, avgTime: 0 });
  const [streak, setStreak] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, { attempted: number; correct: number; avgTime: number }>>({});
  const [recentSessions, setRecentSessions] = useState<{ date: string; accuracy: number; problems: number }[]>([]);
  const [timingStats, setTimingStats] = useState<Record<ProblemCategory, CategoryTimingStats>>({} as Record<ProblemCategory, CategoryTimingStats>);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [totalDaysPracticed, setTotalDaysPracticed] = useState(0);
  const [weakCategories, setWeakCategories] = useState<ProblemCategory[]>([]);
  const [missedByCategory, setMissedByCategory] = useState<Record<ProblemCategory, { missed: number; total: number; rate: number }>>({} as Record<ProblemCategory, { missed: number; total: number; rate: number }>);

  // Load data from localStorage (guest mode)
  const loadLocalData = useCallback(() => {
    setStats(getOverallStats());
    setStreak(getStreak());
    setCategoryStats(getCategoryStats());
    setTimingStats(getCategoryTimingStats());
    setCalendarData(getPracticeCalendar(365));
    setTotalDaysPracticed(getTotalDaysPracticed());
    setWeakCategories(getWeakCategories(5));
    setMissedByCategory(getMissedByCategory());
    setRecentSessions(
      getRecentSessions(5).map((s) => ({
        date: new Date(s.date).toLocaleDateString(),
        accuracy: s.accuracy,
        problems: s.problemsAttempted,
      }))
    );
  }, []);

  // Load data from cloud (logged in)
  const loadCloudData = useCallback(async (userId: string) => {
    try {
      // Check for local data to migrate (only if there's actual data, not empty arrays)
      const localSessionsRaw = localStorage.getItem('pilot-math-sessions');
      const localResultsRaw = localStorage.getItem('pilot-math-results');

      const hasLocalSessions = localSessionsRaw && JSON.parse(localSessionsRaw).length > 0;
      const hasLocalResults = localResultsRaw && JSON.parse(localResultsRaw).length > 0;

      if (hasLocalSessions || hasLocalResults) {
        setMigrating(true);
        const { sessions, results } = await migrateLocalDataToCloud(userId);
        if (sessions > 0 || results > 0) {
          setMigrationMessage(`Migrated ${sessions} sessions and ${results} results to cloud!`);
          setTimeout(() => setMigrationMessage(null), 5000);
        }
        setMigrating(false);
      } else if (localSessionsRaw || localResultsRaw) {
        // Clean up empty arrays from localStorage
        localStorage.removeItem('pilot-math-sessions');
        localStorage.removeItem('pilot-math-results');
      }

      // Load from cloud
      const [cloudSessions, cloudResults, cloudStreak] = await Promise.all([
        getSessionsFromCloud(userId),
        getResultsFromCloud(userId),
        getStreakFromCloud(userId),
      ]);

      // Calculate stats from cloud data
      if (cloudResults.length > 0) {
        const totalProblems = cloudResults.length;
        const totalCorrect = cloudResults.filter(r => r.isCorrect).length;
        const totalTime = cloudResults.reduce((sum, r) => sum + r.timeSpent, 0);

        setStats({
          totalProblems,
          totalCorrect,
          accuracy: Math.round((totalCorrect / totalProblems) * 100),
          avgTime: Math.round(totalTime / totalProblems),
        });

        // Category stats
        const catStats: Record<string, { attempted: number; correct: number; totalTime: number }> = {};
        for (const result of cloudResults) {
          if (!catStats[result.category]) {
            catStats[result.category] = { attempted: 0, correct: 0, totalTime: 0 };
          }
          catStats[result.category].attempted++;
          if (result.isCorrect) catStats[result.category].correct++;
          catStats[result.category].totalTime += result.timeSpent;
        }

        const formattedCatStats: Record<string, { attempted: number; correct: number; avgTime: number }> = {};
        for (const [cat, data] of Object.entries(catStats)) {
          formattedCatStats[cat] = {
            attempted: data.attempted,
            correct: data.correct,
            avgTime: data.attempted > 0 ? Math.round(data.totalTime / data.attempted) : 0,
          };
        }
        setCategoryStats(formattedCatStats);

        // Timing stats
        const timings: Record<string, { times: number[] }> = {};
        for (const result of cloudResults) {
          if (!timings[result.category]) timings[result.category] = { times: [] };
          timings[result.category].times.push(result.timeSpent);
        }
        const formattedTimings: Record<string, CategoryTimingStats> = {};
        for (const [cat, data] of Object.entries(timings)) {
          formattedTimings[cat] = {
            avgTime: data.times.length > 0 ? Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length) : 0,
            fastest: data.times.length > 0 ? Math.min(...data.times) : 0,
            slowest: data.times.length > 0 ? Math.max(...data.times) : 0,
            totalAttempts: data.times.length,
          };
        }
        setTimingStats(formattedTimings as Record<ProblemCategory, CategoryTimingStats>);

        // Weak categories
        const weak = Object.entries(formattedCatStats)
          .filter(([, data]) => data.attempted >= 5)
          .sort((a, b) => (a[1].correct / a[1].attempted) - (b[1].correct / b[1].attempted))
          .slice(0, 5)
          .map(([cat]) => cat as ProblemCategory);
        setWeakCategories(weak);

        // Missed by category
        const missedStats: Record<string, { missed: number; total: number; rate: number }> = {};
        for (const [cat, data] of Object.entries(formattedCatStats)) {
          const missed = data.attempted - data.correct;
          missedStats[cat] = {
            missed,
            total: data.attempted,
            rate: data.attempted > 0 ? Math.round((missed / data.attempted) * 100) : 0,
          };
        }
        setMissedByCategory(missedStats as Record<ProblemCategory, { missed: number; total: number; rate: number }>);
      }

      // Sessions for recent and calendar
      if (cloudSessions.length > 0) {
        setRecentSessions(
          cloudSessions.slice(0, 5).map((s) => ({
            date: new Date(s.date).toLocaleDateString(),
            accuracy: s.accuracy,
            problems: s.problemsAttempted,
          }))
        );

        // Calendar data
        const dailyStats: Record<string, { problems: number; accuracy: number }> = {};
        for (const session of cloudSessions) {
          const dateKey = new Date(session.date).toISOString().split('T')[0];
          if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = { problems: 0, accuracy: 0 };
          }
          dailyStats[dateKey].problems += session.problemsAttempted;
          dailyStats[dateKey].accuracy = session.accuracy; // Use latest
        }

        const calendar: CalendarDay[] = [];
        const today = new Date();
        // Build calendar from today backwards (today first, oldest last)
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          calendar.push({
            date: dateKey,
            problemsAttempted: dailyStats[dateKey]?.problems || 0,
            accuracy: dailyStats[dateKey]?.accuracy || 0,
            sessionsCount: dailyStats[dateKey] ? 1 : 0,
          });
        }
        setCalendarData(calendar);
        setTotalDaysPracticed(Object.keys(dailyStats).length);
      }

      setStreak(cloudStreak.currentStreak);
    } catch (error) {
      console.error('Error loading cloud data:', error);
      // Fall back to local data
      loadLocalData();
    }
  }, [loadLocalData]);

  useEffect(() => {
    setMounted(true);

    if (!authLoading) {
      if (user) {
        loadCloudData(user.id);
      } else {
        loadLocalData();
      }
    }
  }, [user, authLoading, loadLocalData, loadCloudData]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const categoriesPracticed = Object.keys(categoryStats).length;
  const totalCategories = Object.keys(CATEGORY_INFO).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pilot Mental Math</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Daily practice for sharper flying</p>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <Badge className="bg-amber-500 dark:bg-amber-600 text-white text-lg px-3 py-1">
                {streak} day streak
              </Badge>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Synced</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-slate-500">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400"
              >
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Migration Message */}
      {migrationMessage && (
        <div className="bg-emerald-100 dark:bg-emerald-900/50 border-b border-emerald-200 dark:border-emerald-800 p-3 text-center text-emerald-700 dark:text-emerald-300 text-sm">
          {migrationMessage}
        </div>
      )}

      {/* Sync Banner for guests */}
      {!user && stats.totalProblems > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800 p-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>Your progress is stored locally. Sign in to sync across devices.</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="text-blue-600 dark:text-blue-400"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Quick start */}
        <Card className="bg-gradient-to-br from-emerald-100 to-white dark:from-emerald-900/50 dark:to-slate-900 border-emerald-300 dark:border-emerald-800">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to practice?</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Practice sessions with randomized problems from the book.
            </p>
            <Link href="/practice">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8">
                Start Practice Session
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stats overview */}
        {stats.totalProblems > 0 && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalProblems}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Problems Solved</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold ${stats.accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : stats.accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.accuracy}%
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Overall Accuracy</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.avgTime}s</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Avg Time/Problem</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {categoriesPracticed}/{totalCategories}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Categories Practiced</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Focus Areas - Categories needing practice */}
        {weakCategories.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                Focus Areas
                <span className="text-sm font-normal text-amber-600 dark:text-amber-400 ml-2">Categories that need more practice</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {weakCategories.map((category) => {
                  const catStats = categoryStats[category];
                  const accuracy = catStats ? Math.round((catStats.correct / catStats.attempted) * 100) : 0;
                  const info = CATEGORY_INFO[category];
                  return (
                    <div
                      key={category}
                      className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-amber-200 dark:border-amber-800"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">{info?.name || category}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {catStats?.attempted || 0} attempts
                        </span>
                        <span className={`font-bold ${accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {accuracy}%
                        </span>
                      </div>
                      <Progress value={accuracy} className="h-1.5 mt-2" />
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-4">
                Tip: These categories have your lowest accuracy. Focus on them to improve your overall score.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Practice Heatmap */}
        {stats.totalProblems > 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-500">
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>
                Practice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HeatmapCalendar data={calendarData} totalDays={totalDaysPracticed} />
            </CardContent>
          </Card>
        )}

        {/* Speed by Category */}
        {stats.totalProblems > 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-purple-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
                Speed by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimingBreakdown timingStats={timingStats} />
            </CardContent>
          </Card>
        )}

        {/* Most Missed Problems */}
        {stats.totalProblems > 0 && Object.keys(missedByCategory).length > 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
                Miss Rate by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MissedProblems missedByCategory={missedByCategory} />
            </CardContent>
          </Card>
        )}

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-3 rounded">
                    <span className="text-slate-700 dark:text-slate-300">{session.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-500 dark:text-slate-400">{session.problems} problems</span>
                      <span className={session.accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : session.accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}>
                        {session.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category progress */}
        {Object.keys(categoryStats).length > 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Category Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(categoryStats)
                  .sort((a, b) => (b[1].correct / b[1].attempted) - (a[1].correct / a[1].attempted))
                  .map(([category, data]) => {
                    const accuracy = Math.round((data.correct / data.attempted) * 100);
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300">
                            {CATEGORY_INFO[category as ProblemCategory]?.name || category}
                          </span>
                          <span className={accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}>
                            {accuracy}% ({data.attempted})
                          </span>
                        </div>
                        <Progress value={accuracy} className="h-1.5" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick reference link */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Formula Reference</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Quick reference for all mental math formulas</p>
              </div>
              <Link href="/reference">
                <Button variant="outline" className="border-slate-300 dark:border-slate-600">
                  View Formulas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {stats.totalProblems === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p className="text-lg mb-2">No practice data yet</p>
            <p className="text-sm">Start a practice session to track your progress!</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 p-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          Based on &quot;Mental Math for Pilots&quot; by Ronald D. McElroy
        </div>
      </footer>
    </div>
  );
}
