'use client';

import { CATEGORY_INFO, ProblemCategory } from '@/lib/problems';

interface MissedByCategoryStats {
  missed: number;
  total: number;
  rate: number;
}

interface MissedProblemsProps {
  missedByCategory: Record<ProblemCategory, MissedByCategoryStats>;
}

export function MissedProblems({ missedByCategory }: MissedProblemsProps) {
  // Sort by miss rate (highest first), filter to categories with at least 5 attempts
  const sortedCategories = Object.entries(missedByCategory)
    .filter(([, stats]) => stats.total >= 5 && stats.missed > 0)
    .sort((a, b) => b[1].rate - a[1].rate);

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 dark:text-slate-400">
        <p>Not enough data yet. Keep practicing!</p>
        <p className="text-sm mt-1">Categories need at least 5 attempts to show miss rates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedCategories.map(([category, stats]) => {
        const info = CATEGORY_INFO[category as ProblemCategory];
        const isHigh = stats.rate > 30;
        const isMedium = stats.rate > 15 && stats.rate <= 30;

        return (
          <div
            key={category}
            className={`p-3 rounded-lg border ${
              isHigh
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : isMedium
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {info?.name || category}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {stats.missed} missed out of {stats.total} attempts
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                isHigh
                  ? 'text-red-600 dark:text-red-400'
                  : isMedium
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}>
                {stats.rate}%
              </div>
            </div>

            {/* Progress bar showing miss rate */}
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isHigh
                    ? 'bg-red-500'
                    : isMedium
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
                style={{ width: `${stats.rate}%` }}
              />
            </div>

            {isHigh && info?.formula && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                Tip: {info.formula}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
        Categories with the highest miss rates are shown first. Focus on these to improve!
      </p>
    </div>
  );
}
