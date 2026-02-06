'use client';

import { CATEGORY_INFO, ProblemCategory } from '@/lib/problems';
import { CategoryTimingStats } from '@/lib/storage';

interface TimingBreakdownProps {
  timingStats: Record<ProblemCategory, CategoryTimingStats>;
}

export function TimingBreakdown({ timingStats }: TimingBreakdownProps) {
  // Sort by attempts (most practiced first) then by slowest time
  const sortedCategories = Object.entries(timingStats)
    .filter(([, stats]) => stats.totalAttempts > 0)
    .sort((a, b) => b[1].totalAttempts - a[1].totalAttempts);

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-8">
        Complete some practice sessions to see your timing breakdown.
      </div>
    );
  }

  const getTimeColor = (seconds: number) => {
    if (seconds <= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (seconds <= 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-2">
      {sortedCategories.map(([category, stats]) => {
        const info = CATEGORY_INFO[category as ProblemCategory];
        if (!info) return null;

        return (
          <div
            key={category}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 dark:text-white truncate">
                {info.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {stats.totalAttempts} attempts
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Fastest/Slowest range */}
              <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                {formatTime(stats.fastest)} - {formatTime(stats.slowest)}
              </div>

              {/* Average time (prominent) */}
              <div className={`text-lg font-bold ${getTimeColor(stats.avgTime)}`}>
                {formatTime(stats.avgTime)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
