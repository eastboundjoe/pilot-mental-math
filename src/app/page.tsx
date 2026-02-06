'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { HeatmapCalendar } from '@/components/heatmap-calendar';
import { TimingBreakdown } from '@/components/timing-breakdown';
import {
  getOverallStats,
  getCategoryStats,
  getStreak,
  getRecentSessions,
  getCategoryTimingStats,
  getPracticeCalendar,
  getTotalDaysPracticed,
  CalendarDay,
  CategoryTimingStats,
} from '@/lib/storage';
import { CATEGORY_INFO, ProblemCategory } from '@/lib/problems';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ totalProblems: 0, totalCorrect: 0, accuracy: 0, avgTime: 0 });
  const [streak, setStreak] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, { attempted: number; correct: number; avgTime: number }>>({});
  const [recentSessions, setRecentSessions] = useState<{ date: string; accuracy: number; problems: number }[]>([]);
  const [timingStats, setTimingStats] = useState<Record<ProblemCategory, CategoryTimingStats>>({} as Record<ProblemCategory, CategoryTimingStats>);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [totalDaysPracticed, setTotalDaysPracticed] = useState(0);

  useEffect(() => {
    setMounted(true);
    setStats(getOverallStats());
    setStreak(getStreak());
    setCategoryStats(getCategoryStats());
    setTimingStats(getCategoryTimingStats());
    setCalendarData(getPracticeCalendar(365));
    setTotalDaysPracticed(getTotalDaysPracticed());
    setRecentSessions(
      getRecentSessions(5).map((s) => ({
        date: new Date(s.date).toLocaleDateString(),
        accuracy: s.accuracy,
        problems: s.problemsAttempted,
      }))
    );
  }, []);

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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Quick start */}
        <Card className="bg-gradient-to-br from-emerald-100 to-white dark:from-emerald-900/50 dark:to-slate-900 border-emerald-300 dark:border-emerald-800">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to practice?</h2>
            <p className="text-slate-600 dark:text-slate-300">
              30-minute sessions with randomized problems from the book.
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
