'use client';

interface StopwatchTimerProps {
  timeRemaining: number;
  totalTime: number;
  isWarning?: boolean;
}

export function StopwatchTimer({ timeRemaining, totalTime, isWarning = false }: StopwatchTimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = (timeRemaining / totalTime) * 100;

  // Calculate the stroke dasharray for the circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Circular progress ring */}
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-linear ${
            isWarning
              ? 'text-red-500 dark:text-red-400'
              : 'text-emerald-500 dark:text-emerald-400'
          }`}
        />
      </svg>

      {/* Time display in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-mono font-bold tabular-nums ${
          isWarning ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
        }`}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">remaining</span>
      </div>
    </div>
  );
}

interface DurationSelectorProps {
  selectedDuration: number;
  onSelect: (duration: number) => void;
}

const DURATION_OPTIONS = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 25, label: '25 min' },
  { value: 30, label: '30 min' },
];

export function DurationSelector({ selectedDuration, onSelect }: DurationSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm text-slate-500 dark:text-slate-400 block text-center">
        Session Duration
      </label>
      <div className="grid grid-cols-3 gap-2">
        {DURATION_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              selectedDuration === option.value
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
