'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CATEGORY_INFO, ProblemCategory, getAllCategories } from '@/lib/problems';

export default function ReferencePage() {
  const categories = getAllCategories();

  const groupedCategories = {
    'Navigation & Heading': ['reciprocal-heading', 'magnetic-compass', 'drift-angle', 'sixty-to-one'],
    'Wind & Components': ['crosswind', 'headwind-tailwind'],
    'Speed & Distance': ['time-speed-distance', 'true-airspeed', 'turn-radius', 'standard-rate-turn', 'unit-conversion'],
    'Altitude & Descent': ['pressure-altitude', 'descent-planning', 'isa-deviation'],
    'Temperature': ['temp-conversion'],
    'Fuel': ['fuel-weight', 'fuel-dumping'],
    'Safety & Performance': ['hydroplaning', 'visibility-rvr'],
    'Time': ['hours-to-decimal'],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Formula Reference</h1>
            <p className="text-slate-400">Quick reference for all mental math formulas</p>
          </div>
          <Link href="/practice">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Start Practice
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedCategories).map(([groupName, categoryIds]) => (
            <div key={groupName}>
              <h2 className="text-xl font-semibold text-slate-300 mb-4 border-b border-slate-800 pb-2">
                {groupName}
              </h2>
              <div className="grid gap-4">
                {categoryIds.map((catId) => {
                  const info = CATEGORY_INFO[catId as ProblemCategory];
                  if (!info) return null;
                  return (
                    <Card key={catId} className="bg-slate-900 border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white">{info.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-400 text-sm mb-3">{info.description}</p>
                        <div className="bg-slate-800 p-3 rounded font-mono text-sm text-emerald-400">
                          {info.formula}
                        </div>
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
          <h2 className="text-2xl font-bold border-b border-slate-800 pb-2">Quick Reference Tables</h2>

          {/* Time conversion */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Minutes to Decimal Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {[6, 12, 15, 18, 24, 30, 36, 42, 45, 48, 54, 60].map((mins) => (
                  <div key={mins} className="bg-slate-800 p-2 rounded text-center">
                    <span className="text-slate-400">{mins} min = </span>
                    <span className="text-white font-mono">{(mins / 60).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crosswind table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Crosswind Component Multipliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-sm text-center">
                <div className="bg-slate-700 p-2 rounded font-semibold">Angle</div>
                <div className="bg-slate-700 p-2 rounded font-semibold">Crosswind</div>
                <div className="bg-slate-700 p-2 rounded font-semibold">Headwind</div>
                <div className="bg-slate-700 p-2 rounded font-semibold">Quick</div>
                <div className="bg-slate-700 p-2 rounded font-semibold">Memory</div>
                {[
                  ['0°', '0%', '100%', '0', 'None'],
                  ['30°', '50%', '90%', '0.5', 'Half'],
                  ['45°', '70%', '70%', '0.7', 'Two-thirds'],
                  ['60°', '90%', '50%', '0.9', 'Almost all'],
                  ['90°', '100%', '0%', '1.0', 'All'],
                ].map((row, i) => (
                  row.map((cell, j) => (
                    <div key={`${i}-${j}`} className="bg-slate-800 p-2 rounded">
                      {cell}
                    </div>
                  ))
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Speed to NM/min */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Ground Speed to NM per Minute</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-sm">
                {[60, 90, 120, 150, 180, 210, 240, 300, 360, 480].map((speed) => (
                  <div key={speed} className="bg-slate-800 p-2 rounded text-center">
                    <span className="text-slate-400">{speed} kts = </span>
                    <span className="text-white font-mono">{speed / 60}</span>
                    <span className="text-slate-400"> NM/min</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Visibility to RVR */}
          <Card className="bg-slate-900 border-slate-800">
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
                  <div key={vis} className="bg-slate-800 p-3 rounded">
                    <div className="text-slate-400">{vis}</div>
                    <div className="text-white font-semibold">{rvr}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ISA temperatures */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>ISA Standard Temperatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-sm">
                {[
                  [0, 15], [5000, 5], [10000, -5], [15000, -15],
                  [20000, -25], [25000, -35], [30000, -45], [35000, -55],
                ].map(([alt, temp]) => (
                  <div key={alt} className="bg-slate-800 p-2 rounded text-center">
                    <span className="text-slate-400">{(alt as number).toLocaleString()} ft = </span>
                    <span className="text-white font-mono">{temp}°C</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">Formula: ISA = 15°C - (altitude in 1000s × 2)</p>
            </CardContent>
          </Card>

          {/* Fuel weights */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Fuel Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded text-center">
                  <div className="text-lg font-semibold text-blue-400">Avgas</div>
                  <div className="text-2xl font-mono text-white">6.0 lbs/gal</div>
                </div>
                <div className="bg-slate-800 p-4 rounded text-center">
                  <div className="text-lg font-semibold text-amber-400">Jet A</div>
                  <div className="text-2xl font-mono text-white">6.7 lbs/gal</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key conversions */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Key Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="bg-slate-800 p-2 rounded">1 NM = 1.15 SM</div>
                  <div className="bg-slate-800 p-2 rounded">1 SM = 0.87 NM</div>
                  <div className="bg-slate-800 p-2 rounded">1 Knot = 1.15 MPH</div>
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-800 p-2 rounded">1 NM = 6,076 ft</div>
                  <div className="bg-slate-800 p-2 rounded">1 SM = 5,280 ft</div>
                  <div className="bg-slate-800 p-2 rounded">60 knots = 1 NM/min</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Magnetic compass rules */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Magnetic Compass Rules (Northern Hemisphere)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded">
                  <div className="text-lg font-semibold text-emerald-400 mb-2">UNOS</div>
                  <div className="text-slate-300">Undershoot North, Overshoot South</div>
                  <p className="text-slate-500 text-sm mt-2">Add latitude to normal lead point</p>
                </div>
                <div className="bg-slate-800 p-4 rounded">
                  <div className="text-lg font-semibold text-blue-400 mb-2">ANDS</div>
                  <div className="text-slate-300">Accelerate North, Decelerate South</div>
                  <p className="text-slate-500 text-sm mt-2">On E/W headings only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link href="/practice">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Start Practice Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
