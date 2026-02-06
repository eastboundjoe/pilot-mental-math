'use client';

import { useState } from 'react';
import { CalendarDay } from '@/lib/storage';

interface HeatmapCalendarProps {
  data: CalendarDay[];
  totalDays: number;
}

export function HeatmapCalendar({ data, totalDays }: HeatmapCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Get color based on problems attempted
  const getColor = (problems: number) => {
    if (problems === 0) return 'bg-slate-800';
    if (problems <= 10) return 'bg-emerald-900';
    if (problems <= 30) return 'bg-emerald-700';
    if (problems <= 60) return 'bg-emerald-500';
    return 'bg-emerald-400';
  };

  // Get color for light mode
  const getLightColor = (problems: number) => {
    if (problems === 0) return 'bg-slate-200';
    if (problems <= 10) return 'bg-emerald-200';
    if (problems <= 30) return 'bg-emerald-400';
    if (problems <= 60) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  // Group data into weeks (7 days each)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Get month labels (data is now today-first, so months go backwards)
  const getMonthLabels = () => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = '';

    data.forEach((day, index) => {
      const date = new Date(day.date);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      const weekIndex = Math.floor(index / 7);
      const monthYear = `${month} '${year}`;

      if (month !== lastMonth) {
        labels.push({ month: monthYear, weekIndex });
        lastMonth = month;
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  const handleMouseEnter = (day: CalendarDay, event: React.MouseEvent) => {
    setHoveredDay(day);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Stats Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalDays}</span>
          <span className="text-slate-500 dark:text-slate-400 ml-2">days practiced</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-800" />
            <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500" />
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex mb-1 text-xs text-slate-500 dark:text-slate-400">
        {monthLabels.map((label, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{ left: `${label.weekIndex * 14 + 20}px` }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-[3px] mt-6 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-xs text-slate-500 dark:text-slate-400 mr-2">
          <div className="h-[12px]"></div>
          <div className="h-[12px] flex items-center">Mon</div>
          <div className="h-[12px]"></div>
          <div className="h-[12px] flex items-center">Wed</div>
          <div className="h-[12px]"></div>
          <div className="h-[12px] flex items-center">Fri</div>
          <div className="h-[12px]"></div>
        </div>

        {/* Week columns */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => (
              <div
                key={day.date}
                className={`w-[12px] h-[12px] rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-emerald-400 dark:hover:ring-emerald-500 ${getLightColor(day.problemsAttempted)} dark:${getColor(day.problemsAttempted)}`}
                onMouseEnter={(e) => handleMouseEnter(day, e)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-medium">{formatDate(hoveredDay.date)}</div>
          {hoveredDay.problemsAttempted > 0 ? (
            <>
              <div className="text-emerald-400">{hoveredDay.problemsAttempted} problems</div>
              <div className="text-slate-400">{hoveredDay.accuracy}% accuracy</div>
            </>
          ) : (
            <div className="text-slate-400">No practice</div>
          )}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-slate-700" />
        </div>
      )}
    </div>
  );
}
