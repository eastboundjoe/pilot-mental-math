'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { StopwatchTimer, DurationSelector } from '@/components/stopwatch-timer';
import { useAuth } from '@/components/auth-provider';
import {
  generateProblem,
  checkAnswer,
  Problem,
  ProblemResult,
  ProblemCategory,
  CATEGORY_INFO,
  getAllCategories,
} from '@/lib/problems';
import { saveResult, saveSession, updateStreak, SessionStats } from '@/lib/storage';
import { saveResultToCloud, saveSessionToCloud, updateStreakInCloud } from '@/lib/cloud-storage';
import Link from 'next/link';

const DEFAULT_DURATION = 15; // Default 15 minutes

export default function PracticePage() {
  const { user } = useAuth();

  // Session state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(DEFAULT_DURATION);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_DURATION * 60);
  const [totalSessionTime, setTotalSessionTime] = useState(DEFAULT_DURATION * 60);
  const [sessionResults, setSessionResults] = useState<ProblemResult[]>([]);

  // Problem state
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [problemStartTime, setProblemStartTime] = useState(0);

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<ProblemCategory | 'all'>('all');

  // Session end modal
  const [showSummary, setShowSummary] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Hint visibility
  const [showHint, setShowHint] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining]);

  const loadNextProblem = useCallback(() => {
    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    const problem = generateProblem(category);
    setCurrentProblem(problem);
    setUserAnswer('');
    setShowResult(false);
    setShowExplanation(false);
    setShowHint(false);
    setProblemStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [selectedCategory]);

  const startSession = async () => {
    const durationInSeconds = sessionDuration * 60;
    setIsRunning(true);
    setIsPaused(false);
    setTimeRemaining(durationInSeconds);
    setTotalSessionTime(durationInSeconds);
    setSessionResults([]);
    setSessionEnded(false);
    loadNextProblem();

    // Update streak (local and cloud)
    updateStreak();
    if (user) {
      try {
        await updateStreakInCloud(user.id);
      } catch (error) {
        console.error('Error updating cloud streak:', error);
      }
    }
  };

  const endSession = useCallback(async () => {
    // Prevent double-saving (React strict mode or rapid clicks)
    if (sessionEnded) return;
    setSessionEnded(true);

    setIsRunning(false);
    setShowSummary(true);

    // Calculate session stats
    if (sessionResults.length > 0) {
      const correct = sessionResults.filter((r) => r.isCorrect).length;
      const totalTime = sessionResults.reduce((sum, r) => sum + r.timeSpent, 0);

      const categoryBreakdown: Record<ProblemCategory, { attempted: number; correct: number }> = {} as Record<ProblemCategory, { attempted: number; correct: number }>;
      for (const result of sessionResults) {
        if (!categoryBreakdown[result.category]) {
          categoryBreakdown[result.category] = { attempted: 0, correct: 0 };
        }
        categoryBreakdown[result.category].attempted++;
        if (result.isCorrect) {
          categoryBreakdown[result.category].correct++;
        }
      }

      const session: SessionStats = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: totalSessionTime - timeRemaining,
        problemsAttempted: sessionResults.length,
        problemsCorrect: correct,
        accuracy: Math.round((correct / sessionResults.length) * 100),
        averageTime: Math.round(totalTime / sessionResults.length),
        categoryBreakdown,
      };

      // Save to cloud if logged in, otherwise save locally
      if (user) {
        try {
          await saveSessionToCloud(user.id, session);
        } catch (error) {
          console.error('Error saving session to cloud:', error);
          // Fallback to local save if cloud fails
          saveSession(session);
        }
      } else {
        saveSession(session);
      }
    }
  }, [sessionResults, timeRemaining, totalSessionTime, user, sessionEnded]);

  const submitAnswer = async () => {
    if (!currentProblem || showResult) return;

    const answer = parseFloat(userAnswer);
    if (isNaN(answer)) return;

    const correct = checkAnswer(currentProblem, answer);
    const timeSpent = Math.round((Date.now() - problemStartTime) / 1000);

    setIsCorrect(correct);
    setShowResult(true);

    const result: ProblemResult = {
      problemId: currentProblem.id,
      category: currentProblem.category,
      userAnswer: answer,
      correctAnswer: currentProblem.correctAnswer,
      isCorrect: correct,
      timeSpent,
      timestamp: Date.now(),
    };

    setSessionResults((prev) => [...prev, result]);

    // Save to cloud if logged in, otherwise save locally
    if (user) {
      try {
        await saveResultToCloud(user.id, result);
      } catch (error) {
        console.error('Error saving result to cloud:', error);
        // Fallback to local save if cloud fails
        saveResult(result);
      }
    } else {
      saveResult(result);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showResult) {
        loadNextProblem();
      } else {
        submitAnswer();
      }
    }
  };

  const currentAccuracy = sessionResults.length > 0
    ? Math.round((sessionResults.filter((r) => r.isCorrect).length / sessionResults.length) * 100)
    : 0;

  // Not started yet
  if (!isRunning && !showSummary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              ← Back to Home
            </Link>
            <ThemeToggle />
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Start Practice Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <DurationSelector
                selectedDuration={sessionDuration}
                onSelect={setSessionDuration}
              />

              <div>
                <label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block text-center">Focus Category (optional)</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ProblemCategory | 'all')}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories (Random Mix)</option>
                  {getAllCategories().map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_INFO[cat].name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center space-y-4 pt-2">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Focus on accuracy first, speed will follow.
                </p>
                <Button
                  onClick={startSession}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-12 py-6 rounded-xl shadow-lg shadow-emerald-500/25"
                >
                  Start {sessionDuration} Min Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Session summary
  if (showSummary) {
    const correct = sessionResults.filter((r) => r.isCorrect).length;
    const total = sessionResults.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Session Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{total}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Problems</div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{correct}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Correct</div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                  <div className={`text-3xl font-bold ${accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : accuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {accuracy}%
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Accuracy</div>
                </div>
              </div>

              {total > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Category Breakdown:</h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {Object.entries(
                      sessionResults.reduce((acc, r) => {
                        if (!acc[r.category]) acc[r.category] = { correct: 0, total: 0 };
                        acc[r.category].total++;
                        if (r.isCorrect) acc[r.category].correct++;
                        return acc;
                      }, {} as Record<string, { correct: number; total: number }>)
                    ).map(([cat, stats]) => (
                      <div key={cat} className="flex justify-between text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded">
                        <span>{CATEGORY_INFO[cat as ProblemCategory]?.name || cat}</span>
                        <span className={stats.correct === stats.total ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                          {stats.correct}/{stats.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setShowSummary(false);
                    startSession();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Practice Again
                </Button>
                <Link href="/">
                  <Button variant="outline" className="border-slate-300 dark:border-slate-600">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Active session
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Timer and stats bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <StopwatchTimer
              timeRemaining={timeRemaining}
              totalTime={totalSessionTime}
              isWarning={timeRemaining < 60}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="text-slate-500 dark:text-slate-400"
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </Button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600">
                {sessionResults.length} answered
              </Badge>
              <Badge
                variant="outline"
                className={`border-slate-300 dark:border-slate-600 ${currentAccuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : currentAccuracy >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {currentAccuracy}% accuracy
              </Badge>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Paused overlay */}
        {isPaused && (
          <div className="fixed inset-0 bg-white/90 dark:bg-slate-950/90 flex items-center justify-center z-50">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Session Paused</h2>
              <div className="flex gap-4">
                <Button onClick={() => setIsPaused(false)} className="bg-emerald-600 text-white">
                  Resume
                </Button>
                <Button variant="destructive" onClick={endSession}>
                  End Session
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Problem card */}
        {currentProblem && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {CATEGORY_INFO[currentProblem.category].name}
                </Badge>
                {currentProblem.hint && !showHint && !showResult && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(true)}
                    className="text-slate-500 dark:text-slate-400 text-sm"
                  >
                    Show Hint
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-xl md:text-2xl font-medium text-center py-4">
                {currentProblem.question}
              </div>

              {showHint && currentProblem.hint && !showResult && (
                <div className="text-sm text-slate-600 dark:text-slate-400 text-center bg-slate-100 dark:bg-slate-800 p-3 rounded">
                  {currentProblem.hint}
                </div>
              )}

              <div className="flex gap-4 items-center justify-center">
                <Input
                  ref={inputRef}
                  type="number"
                  step="any"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={showResult}
                  placeholder="Your answer"
                  className="w-40 text-center text-xl bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <span className="text-slate-500 dark:text-slate-400">{currentProblem.unit}</span>
              </div>

              {!showResult ? (
                <Button
                  onClick={submitAnswer}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!userAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={`text-center p-4 rounded-lg ${isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'}`}>
                    {isCorrect ? (
                      <span className="text-xl">Correct!</span>
                    ) : (
                      <span className="text-xl">
                        Incorrect. Answer: {currentProblem.correctAnswer} {currentProblem.unit}
                      </span>
                    )}
                  </div>

                  {!isCorrect && !showExplanation && (
                    <Button
                      variant="outline"
                      onClick={() => setShowExplanation(true)}
                      className="w-full border-slate-300 dark:border-slate-600"
                    >
                      Show Explanation
                    </Button>
                  )}

                  {showExplanation && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Explanation:</div>
                      <div className="text-slate-800 dark:text-slate-200">{currentProblem.explanation}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        Formula: {CATEGORY_INFO[currentProblem.category].formula}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={loadNextProblem}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Next Problem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={endSession}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            End Session Early
          </Button>
        </div>
      </div>
    </div>
  );
}
