'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { CATEGORY_INFO, ProblemCategory } from '@/lib/problems';

export default function ReferencePage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExample = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const groupedCategories = {
    'Navigation & Heading': ['reciprocal-heading', 'magnetic-compass', 'drift-angle', 'sixty-to-one', 'holding-pattern', 'slant-range'],
    'Wind & Components': ['crosswind', 'headwind-tailwind'],
    'Speed & Distance': ['time-speed-distance', 'true-airspeed', 'turn-radius', 'standard-rate-turn', 'unit-conversion'],
    'Altitude & Descent': ['pressure-altitude', 'descent-planning', 'visual-descent-point', 'isa-deviation', 'glide-distance'],
    'Weather': ['temp-conversion', 'cloud-base'],
    'Fuel': ['fuel-weight', 'fuel-dumping', 'fuel-endurance'],
    'Safety & Performance': ['hydroplaning', 'visibility-rvr'],
    'Time': ['hours-to-decimal'],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Formula Reference</h1>
            <p className="text-slate-500 dark:text-slate-400">Quick reference for all mental math formulas</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/practice">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Start Practice
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedCategories).map(([groupName, categoryIds]) => (
            <div key={groupName}>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                {groupName}
              </h2>
              <div className="grid gap-4">
                {categoryIds.map((catId) => {
                  const info = CATEGORY_INFO[catId as ProblemCategory];
                  if (!info) return null;
                  const isExpanded = expandedCategories.has(catId);
                  return (
                    <Card key={catId} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{info.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{info.description}</p>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm text-emerald-700 dark:text-emerald-400 mb-3">
                          {info.formula}
                        </div>

                        {/* Show Example Button */}
                        <button
                          onClick={() => toggleExample(catId)}
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                          {isExpanded ? 'Hide Example' : 'Show Step-by-Step Example'}
                        </button>

                        {/* Expanded Example */}
                        {isExpanded && info.example && (
                          <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                            {/* Problem */}
                            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Problem</div>
                              <div className="text-slate-800 dark:text-slate-200 font-medium">{info.example.problem}</div>
                            </div>

                            {/* Steps */}
                            <div className="space-y-3 mb-4">
                              {info.example.steps.map((step, index) => (
                                <div key={index} className="flex gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-mono text-slate-900 dark:text-white font-medium">{step.step}</div>
                                    <div className="text-slate-500 dark:text-slate-400 text-sm">{step.explanation}</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Answer */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-3">
                              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Answer</div>
                              <div className="text-emerald-800 dark:text-emerald-200 font-bold text-lg">{info.example.answer}</div>
                            </div>

                            {/* Tip */}
                            {info.example.tip && (
                              <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                                <div className="flex items-start gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5">
                                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
                                  </svg>
                                  <div>
                                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Pro Tip</div>
                                    <div className="text-amber-800 dark:text-amber-200 text-sm">{info.example.tip}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Video Link */}
                            {info.videoUrl && (
                              <a
                                href={info.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0">
                                  <path fillRule="evenodd" d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Video Explanation</div>
                                  <div className="text-red-700 dark:text-red-300 text-sm">Watch on YouTube →</div>
                                </div>
                              </a>
                            )}

                            {/* Practice This Button */}
                            <Link href={`/practice?category=${catId}`}>
                              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                </svg>
                                Practice {info.name}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quick reference tables */}
        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Quick Reference Tables</h2>

          {/* Time conversion */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Minutes to Decimal Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {[6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54, 60].map((mins) => (
                  <div key={mins} className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                    <span className="text-slate-500 dark:text-slate-400">{mins} min = </span>
                    <span className="font-mono">{(mins / 60).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crosswind table */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Crosswind Component Multipliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-sm text-center">
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded font-semibold">Angle</div>
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded font-semibold">Crosswind</div>
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded font-semibold">Headwind</div>
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded font-semibold">Quick</div>
                <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded font-semibold">Memory</div>
                {[
                  ['0°', '0%', '100%', '0', 'None'],
                  ['30°', '50%', '90%', '0.5', 'Half'],
                  ['45°', '70%', '70%', '0.7', 'Two-thirds'],
                  ['60°', '90%', '50%', '0.9', 'Almost all'],
                  ['90°', '100%', '0%', '1.0', 'All'],
                ].map((row, i) => (
                  row.map((cell, j) => (
                    <div key={`${i}-${j}`} className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      {cell}
                    </div>
                  ))
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Speed to NM/min */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Speed to Distance (NM per Minute)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3 text-sm">
                {[
                  [60, 1], [120, 2], [180, 3], [240, 4], [300, 5],
                ].map(([speed, nm]) => (
                  <div key={speed} className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center">
                    <div className="text-lg font-mono font-semibold text-blue-600 dark:text-blue-400">{speed} kts</div>
                    <div className="text-slate-500 dark:text-slate-400">=</div>
                    <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{nm} NM/min</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-3">Pattern: Divide ground speed by 60 to get NM per minute. Easy to remember: 60 kts = 1 mile per minute!</p>
            </CardContent>
          </Card>

          {/* Visibility to RVR */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Visibility to RVR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-sm text-center">
                {[
                  ['1/4 SM', '1600 ft'],
                  ['1/2 SM', '2400 ft'],
                  ['3/4 SM', '4000 ft'],
                  ['1 SM', '5000 ft'],
                  ['1.5 SM', '6000 ft'],
                ].map(([vis, rvr]) => (
                  <div key={vis} className="bg-slate-100 dark:bg-slate-800 p-3 rounded">
                    <div className="text-slate-500 dark:text-slate-400">{vis}</div>
                    <div className="font-semibold">{rvr}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Square Roots for Hydroplaning */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Square Roots (for Hydroplaning)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-sm">
                {[
                  [36, 6], [49, 7], [64, 8], [81, 9], [100, 10], [121, 11],
                  [144, 12], [169, 13], [196, 14], [225, 15], [256, 16], [289, 17],
                ].map(([num, root]) => (
                  <div key={num} className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                    <span className="text-slate-500 dark:text-slate-400">√</span>
                    <span className="font-mono">{num}</span>
                    <span className="text-slate-500 dark:text-slate-400"> = </span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{root}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">Hydroplaning speed = 9 × √(tire pressure). Example: 144 psi → 9 × 12 = 108 knots</p>
            </CardContent>
          </Card>

          {/* ISA temperatures */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>ISA Standard Temperatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {[
                  [0, 15], [5000, 5], [10000, -5], [15000, -15],
                  [20000, -25], [25000, -35], [30000, -45], [35000, -55],
                ].map(([alt, temp]) => (
                  <div key={alt} className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-center">
                    <span className="text-slate-500 dark:text-slate-400">{(alt as number).toLocaleString()} ft = </span>
                    <span className="font-mono">{temp}°C</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">Formula: ISA = 15°C - (altitude in 1000s × 2)</p>
            </CardContent>
          </Card>

          {/* Fuel weights */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Fuel Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded text-center">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">Avgas</div>
                  <div className="text-2xl font-mono">6.0 lbs/gal</div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded text-center">
                  <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">Jet A</div>
                  <div className="text-2xl font-mono">6.7 lbs/gal</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key conversions */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Key Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">1 NM = 1.15 SM</div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">1 SM = 0.87 NM</div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">1 Knot = 1.15 MPH</div>
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">1 NM = 6,076 ft</div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">1 SM = 5,280 ft</div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">60 knots = 1 NM/min</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Magnetic compass rules */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Magnetic Compass Rules (Northern Hemisphere)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded">
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">UNOS</div>
                  <div className="text-slate-700 dark:text-slate-300">Undershoot North, Overshoot South</div>
                  <p className="text-slate-500 text-sm mt-2">Add latitude to normal lead point</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded">
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">ANDS</div>
                  <div className="text-slate-700 dark:text-slate-300">Accelerate North, Decelerate South</div>
                  <p className="text-slate-500 text-sm mt-2">On E/W headings only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/practice">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Start Practice Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
