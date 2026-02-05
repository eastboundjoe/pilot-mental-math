export type ProblemCategory =
  | 'hours-to-decimal'
  | 'reciprocal-heading'
  | 'hydroplaning'
  | 'temp-conversion'
  | 'isa-deviation'
  | 'pressure-altitude'
  | 'crosswind'
  | 'headwind-tailwind'
  | 'drift-angle'
  | 'unit-conversion'
  | 'visibility-rvr'
  | 'fuel-weight'
  | 'fuel-dumping'
  | 'magnetic-compass'
  | 'sixty-to-one'
  | 'standard-rate-turn'
  | 'turn-radius'
  | 'true-airspeed'
  | 'time-speed-distance'
  | 'descent-planning';

export interface Problem {
  id: string;
  category: ProblemCategory;
  question: string;
  correctAnswer: number;
  tolerance: number; // Acceptable margin of error (e.g., 0.05 for 5%)
  unit: string;
  hint?: string;
  explanation: string;
}

export interface ProblemResult {
  problemId: string;
  category: ProblemCategory;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  timestamp: number;
}

export interface SessionStats {
  id: string;
  date: string;
  duration: number; // in seconds
  problemsAttempted: number;
  problemsCorrect: number;
  accuracy: number;
  averageTime: number;
  categoryBreakdown: Record<ProblemCategory, { attempted: number; correct: number }>;
}

export const CATEGORY_INFO: Record<ProblemCategory, { name: string; description: string; formula: string }> = {
  'hours-to-decimal': {
    name: 'Hours to Decimal',
    description: 'Convert time in hours:minutes to decimal hours',
    formula: 'Every 6 minutes = 0.1 hour (e.g., 1:15 = 1.25 hours)'
  },
  'reciprocal-heading': {
    name: 'Reciprocal Heading',
    description: 'Calculate the opposite heading (180° difference)',
    formula: 'If heading < 180°: Add 200, subtract 20. If heading > 180°: Subtract 200, add 20'
  },
  'hydroplaning': {
    name: 'Hydroplaning Speed',
    description: 'Calculate minimum hydroplaning speed',
    formula: 'V = 9 × √(tire pressure in psi)'
  },
  'temp-conversion': {
    name: 'Temperature Conversion',
    description: 'Convert between Fahrenheit and Celsius',
    formula: '°F = (°C × 2) - 10% + 32  |  °C = (°F - 32 + 10%) ÷ 2'
  },
  'isa-deviation': {
    name: 'ISA Temperature',
    description: 'Calculate ISA temperature and deviation',
    formula: 'ISA = 15°C - (altitude in 1000s × 2). Deviation = Actual - ISA'
  },
  'pressure-altitude': {
    name: 'Pressure Altitude',
    description: 'Calculate pressure altitude from altimeter setting',
    formula: 'For each 0.01" Hg difference from 29.92: ±10 feet'
  },
  'crosswind': {
    name: 'Crosswind Component',
    description: 'Calculate crosswind from wind angle',
    formula: '30° = 50%, 45° = 70%, 60° = 90%, 90° = 100% of wind speed'
  },
  'headwind-tailwind': {
    name: 'Headwind/Tailwind',
    description: 'Calculate headwind or tailwind component',
    formula: '0° = 100%, 30° = 90%, 45° = 70%, 60° = 50%, 90° = 0% of wind speed'
  },
  'drift-angle': {
    name: 'Drift Angle',
    description: 'Calculate drift angle from crosswind',
    formula: 'Drift = (Crosswind × 60) ÷ TAS. Or: 1° per (TAS÷60) knots of crosswind'
  },
  'unit-conversion': {
    name: 'Unit Conversion',
    description: 'Convert between nautical/statute miles, knots/mph',
    formula: '1 NM = 1.15 SM, 1 Knot = 1.15 MPH, 60 knots = 1 NM/min'
  },
  'visibility-rvr': {
    name: 'Visibility to RVR',
    description: 'Convert visibility (SM) to runway visual range (feet)',
    formula: '1/4 SM = 1600ft, 1/2 SM = 2400ft, 3/4 SM = 4000ft, 1 SM = 5000ft'
  },
  'fuel-weight': {
    name: 'Fuel Weight',
    description: 'Convert between gallons and pounds of fuel',
    formula: 'Avgas: 6.0 lbs/gal | Jet A: 6.7 lbs/gal'
  },
  'fuel-dumping': {
    name: 'Fuel Dumping',
    description: 'Calculate fuel dump time or amount',
    formula: 'Time = Fuel ÷ Dump Rate  |  Fuel = Dump Rate × Time'
  },
  'magnetic-compass': {
    name: 'Magnetic Compass',
    description: 'Compass error corrections for turns',
    formula: 'UNOS: Undershoot North, Overshoot South. Add latitude to lead/lag.'
  },
  'sixty-to-one': {
    name: '60-to-1 Rule',
    description: 'Calculate arc distance or radials crossed',
    formula: 'At 60 NM: 1° = 1 NM. Radials per mile = 60 ÷ DME'
  },
  'standard-rate-turn': {
    name: 'Standard Rate Turn',
    description: 'Calculate bank angle for 3°/sec turn',
    formula: 'Bank Angle = (TAS ÷ 10) × 1.5 (max 30° for IFR)'
  },
  'turn-radius': {
    name: 'Turn Radius',
    description: 'Calculate turn radius in nautical miles',
    formula: 'Turn Radius = TAS ÷ 200  |  Or: (Mach × 10) - 2 at high speed'
  },
  'true-airspeed': {
    name: 'True Airspeed',
    description: 'Calculate TAS from IAS and altitude',
    formula: 'TAS = IAS + (IAS × Altitude in 1000s × 2%)'
  },
  'time-speed-distance': {
    name: 'Time-Speed-Distance',
    description: 'Calculate time, speed, or distance',
    formula: 'Distance = Ground Speed × Time. 60 knots = 1 NM/min'
  },
  'descent-planning': {
    name: 'Descent Planning',
    description: 'Calculate top of descent distance',
    formula: '3-to-1 Rule: Distance = Altitude to lose (in 1000s) × 3'
  }
};
