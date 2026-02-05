'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getOverallStats, getCategoryStats, getStreak, getRecentSessions } from '@/lib/storage';
import { CATEGORY_INFO, ProblemCategory } from '@/lib/problems';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ totalProblems: 0, totalCorrect: 0, accuracy: 0, avgTime: 0 });
  const [streak, setStreak] = useState(0);
  const [categoryStats, setCategoryStats] = useState<Record<string, { attempted: number; correct: number; avgTime: number }>>({});
  const [recentSessions, setRecentSessions] = useState<{ date: string; accuracy: number; problems: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setStats(getOverallStats());
    setStreak(getStreak());
    setCategoryStats(getCategoryStats());
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const categoriesPracticed = Object.keys(categoryStats).length;
  const totalCategories = Object.keys(CATEGORY_INFO).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pilot Mental Math</h1>
            <p className="text-slate-400 text-sm">Daily practice for sharper flying</p>
          </div>
          {streak > 0 && (
            <Badge className="bg-amber-600 text-lg px-3 py-1">
              {streak} day streak
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Quick start */}
        <Card className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border-emerald-800">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Ready to practice?</h2>
            <p className="text-slate-300">
              30-minute sessions with randomized problems from the book.
            </p>
            <Link href="/practice">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                Start Practice Session
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stats overview */}
        {stats.totalProblems > 0 && (
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.totalProblems}</div>
                <div className="text-sm text-slate-400">Problems Solved</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 text-center">
                <div className={`text-3xl font-bold ${stats.accuracy >= 80 ? 'text-emerald-400' : stats.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {stats.accuracy}%
                </div>
                <div className="text-sm text-slate-400">Overall Accuracy</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.avgTime}s</div>
                <div className="text-sm text-slate-400">Avg Time/Problem</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400">
                  {categoriesPracticed}/{totalCategories}
                </div>
                <div className="text-sm text-slate-400">Categories Practiced</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800 p-3 rounded">
                    <span className="text-slate-300">{session.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">{session.problems} problems</span>
                      <span className={session.accuracy >= 80 ? 'text-emerald-400' : session.accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}>
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
          <Card className="bg-slate-900 border-slate-800">
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
                          <span className="text-slate-300">
                            {CATEGORY_INFO[category as ProblemCategory]?.name || category}
                          </span>
                          <span className={accuracy >= 80 ? 'text-emerald-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'}>
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
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Formula Reference</h3>
                <p className="text-sm text-slate-400">Quick reference for all mental math formulas</p>
              </div>
              <Link href="/reference">
                <Button variant="outline" className="border-slate-600">
                  View Formulas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {stats.totalProblems === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-2">No practice data yet</p>
            <p className="text-sm">Start a practice session to track your progress!</p>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 p-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          Based on &quot;Mental Math for Pilots&quot; by Ronald D. McElroy
        </div>
      </footer>
    </div>
  );
}
