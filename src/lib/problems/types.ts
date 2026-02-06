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
  | 'descent-planning'
  | 'visual-descent-point'
  | 'glide-distance'
  | 'cloud-base';

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

export interface ExampleStep {
  step: string;
  explanation: string;
}

export interface CategoryExample {
  problem: string;
  steps: ExampleStep[];
  answer: string;
  tip?: string;
}

export interface CategoryInfo {
  name: string;
  description: string;
  formula: string;
  example: CategoryExample;
}

export const CATEGORY_INFO: Record<ProblemCategory, CategoryInfo> = {
  'hours-to-decimal': {
    name: '⏱️ Hours to Decimal',
    description: 'Convert time in hours:minutes to decimal hours',
    formula: 'Every 6 minutes = 0.1 hour (e.g., 1:15 = 1.25 hours)',
    example: {
      problem: 'Convert 2 hours 45 minutes to decimal hours',
      steps: [
        { step: 'Start with hours: 2', explanation: 'The hours stay the same' },
        { step: 'Convert 45 minutes', explanation: 'Every 6 minutes = 0.1 hours' },
        { step: '45 ÷ 6 = 7.5 tenths', explanation: '45 minutes = 0.75 hours' },
        { step: '2 + 0.75 = 2.75', explanation: 'Add hours + decimal minutes' }
      ],
      answer: '2.75 hours',
      tip: 'Quick trick: 15 min = 0.25, 30 min = 0.50, 45 min = 0.75'
    }
  },
  'reciprocal-heading': {
    name: '🧭 Reciprocal Heading',
    description: 'Calculate the opposite heading (180° difference)',
    formula: 'If heading < 180°: Add 200, subtract 20. If heading > 180°: Subtract 200, add 20',
    example: {
      problem: 'What is the reciprocal of heading 070°?',
      steps: [
        { step: 'Heading is 070°', explanation: 'Less than 180°, so ADD 200, subtract 20' },
        { step: '070 + 200 = 270', explanation: 'First, add 200' },
        { step: '270 - 20 = 250', explanation: 'Then subtract 20' }
      ],
      answer: '250°',
      tip: 'The ±200 ±20 method avoids dealing with 180 directly. For 270°: 270 - 200 + 20 = 090°'
    }
  },
  'hydroplaning': {
    name: '🌊 Hydroplaning Speed',
    description: 'Calculate minimum hydroplaning speed',
    formula: 'V = 9 × √(tire pressure in psi)',
    example: {
      problem: 'Tire pressure is 49 psi. What is the hydroplaning speed?',
      steps: [
        { step: 'Find √49', explanation: 'Square root of tire pressure' },
        { step: '√49 = 7', explanation: '7 × 7 = 49' },
        { step: '9 × 7 = 63', explanation: 'Multiply by 9' }
      ],
      answer: '63 knots',
      tip: 'Memorize common square roots: √36=6, √49=7, √64=8, √81=9, √100=10, √121=11'
    }
  },
  'temp-conversion': {
    name: '🌡️ Temperature Conversion',
    description: 'Convert between Fahrenheit and Celsius',
    formula: '°F = (°C × 2) - 10% + 32  |  °C = (°F - 32 + 10%) ÷ 2',
    example: {
      problem: 'Convert 20°C to Fahrenheit',
      steps: [
        { step: '20 × 2 = 40', explanation: 'Double the Celsius temperature' },
        { step: '10% of 40 = 4', explanation: 'Calculate 10% to subtract' },
        { step: '40 - 4 = 36', explanation: 'Subtract the 10%' },
        { step: '36 + 32 = 68', explanation: 'Add 32' }
      ],
      answer: '68°F',
      tip: 'The "minus 10%" compensates for the actual 1.8 multiplier (2 - 10% of 2 = 1.8)'
    }
  },
  'isa-deviation': {
    name: '📊 ISA Temperature',
    description: 'Calculate ISA temperature and deviation',
    formula: 'ISA = 15°C - (altitude in 1000s × 2). Deviation = Actual - ISA',
    example: {
      problem: 'At FL250, actual temp is -40°C. What is ISA deviation?',
      steps: [
        { step: 'FL250 = 25,000 ft', explanation: 'Convert flight level to altitude' },
        { step: 'ISA = 15 - (25 × 2)', explanation: 'Use the formula' },
        { step: 'ISA = 15 - 50 = -35°C', explanation: 'Standard temp at FL250' },
        { step: 'Deviation = -40 - (-35)', explanation: 'Actual minus ISA' },
        { step: '-40 + 35 = -5', explanation: 'ISA -5°C (colder than standard)' }
      ],
      answer: 'ISA -5°C',
      tip: 'ISA drops 2°C per 1000ft. Sea level = 15°C, 10,000ft = -5°C, 20,000ft = -25°C'
    }
  },
  'pressure-altitude': {
    name: '📏 Pressure Altitude',
    description: 'Calculate pressure altitude from altimeter setting',
    formula: 'For each 0.01" Hg difference from 29.92: ±10 feet',
    example: {
      problem: 'Field elevation 2,000 ft, altimeter 30.42. What is pressure altitude?',
      steps: [
        { step: '30.42 - 29.92 = 0.50', explanation: 'Difference from standard' },
        { step: '0.50 × 100 = 50', explanation: 'Convert to hundredths' },
        { step: '50 × 10 = 500 ft', explanation: 'Each 0.01" = 10 feet' },
        { step: 'High pressure = lower altitude', explanation: 'Subtract from field elevation' },
        { step: '2,000 - 500 = 1,500', explanation: 'Pressure altitude' }
      ],
      answer: '1,500 ft',
      tip: '"High to low, look out below" - High pressure means subtract, low pressure means add'
    }
  },
  'crosswind': {
    name: '💨 Crosswind Component',
    description: 'Calculate crosswind from wind angle',
    formula: '30° = 50%, 45° = 70%, 60° = 90%, 90° = 100% of wind speed',
    example: {
      problem: 'Runway 09, Wind 060° at 20 knots. What is the crosswind?',
      steps: [
        { step: 'Runway 09 = 090°', explanation: 'Convert runway to heading' },
        { step: '090 - 060 = 30°', explanation: 'Angle between runway and wind' },
        { step: '30° = 50% crosswind', explanation: 'Use the crosswind table' },
        { step: '20 × 0.50 = 10', explanation: 'Apply percentage to wind speed' }
      ],
      answer: '10 knots crosswind',
      tip: 'Memorize: 30°=½, 45°=¾, 60°=almost all, 90°=full crosswind'
    }
  },
  'headwind-tailwind': {
    name: '🎯 Headwind/Tailwind',
    description: 'Calculate headwind or tailwind component',
    formula: '0° = 100%, 30° = 90%, 45° = 70%, 60° = 50%, 90° = 0% of wind speed',
    example: {
      problem: 'Runway 27, Wind 300° at 30 knots. What is the headwind?',
      steps: [
        { step: 'Runway 27 = 270°', explanation: 'Convert runway to heading' },
        { step: '300 - 270 = 30°', explanation: 'Angle off the nose' },
        { step: '30° = 90% headwind', explanation: 'Use the headwind table' },
        { step: '30 × 0.90 = 27', explanation: 'Apply percentage to wind speed' }
      ],
      answer: '27 knots headwind',
      tip: 'Headwind percentages are opposite of crosswind. Direct headwind = 100%, 90° off = 0%'
    }
  },
  'drift-angle': {
    name: '↗️ Drift Angle',
    description: 'Calculate drift angle from crosswind',
    formula: 'Drift = (Crosswind × 60) ÷ TAS. Or: 1° per (TAS÷60) knots of crosswind',
    example: {
      problem: 'TAS 120 knots, crosswind 10 knots. What is drift angle?',
      steps: [
        { step: 'TAS ÷ 60 = 120 ÷ 60 = 2', explanation: 'NM per minute' },
        { step: '1° drift per 2 knots crosswind', explanation: 'At 120 kts TAS' },
        { step: '10 ÷ 2 = 5°', explanation: 'Crosswind ÷ (TAS/60)' }
      ],
      answer: '5° drift',
      tip: 'At 60 kts: 1° per 1 kt crosswind. At 120 kts: 1° per 2 kts. At 180 kts: 1° per 3 kts.'
    }
  },
  'unit-conversion': {
    name: '🔄 Unit Conversion',
    description: 'Convert between nautical/statute miles, knots/mph',
    formula: '1 NM = 1.15 SM, 1 Knot = 1.15 MPH, 60 knots = 1 NM/min',
    example: {
      problem: 'Convert 100 NM to statute miles',
      steps: [
        { step: '1 NM = 1.15 SM', explanation: 'Conversion factor' },
        { step: '100 × 1.15 = 115', explanation: 'Multiply NM by 1.15' }
      ],
      answer: '115 statute miles',
      tip: 'NM to SM: add 15%. SM to NM: subtract 13% (or ÷ 1.15)'
    }
  },
  'visibility-rvr': {
    name: '👁️ Visibility to RVR',
    description: 'Convert visibility (SM) to runway visual range (feet)',
    formula: '1/4 SM = 1600ft, 1/2 SM = 2400ft, 3/4 SM = 4000ft, 1 SM = 5000ft',
    example: {
      problem: 'Visibility is 1/2 SM. What is the equivalent RVR?',
      steps: [
        { step: 'Look up 1/2 SM in table', explanation: 'This is a memorization problem' },
        { step: '1/2 SM = 2400 ft RVR', explanation: 'From FAA conversion table' }
      ],
      answer: '2400 feet',
      tip: 'Memorize the key values: 1/4=1600, 1/2=2400, 3/4=4000, 1=5000, 1.5=6000'
    }
  },
  'fuel-weight': {
    name: '⛽ Fuel Weight',
    description: 'Convert between gallons and pounds of fuel',
    formula: 'Avgas: 6.0 lbs/gal | Jet A: 6.7 lbs/gal',
    example: {
      problem: 'How much does 50 gallons of Jet A weigh?',
      steps: [
        { step: 'Jet A = 6.7 lbs/gal', explanation: 'Use Jet A density' },
        { step: '50 × 6.7 = 335', explanation: 'Multiply gallons by weight' }
      ],
      answer: '335 lbs',
      tip: 'Round for quick math: Avgas ≈ 6 lbs/gal, Jet A ≈ 7 lbs/gal (slightly heavy estimate)'
    }
  },
  'fuel-dumping': {
    name: '🚿 Fuel Dumping',
    description: 'Calculate fuel dump time or amount',
    formula: 'Time = Fuel ÷ Dump Rate  |  Fuel = Dump Rate × Time',
    example: {
      problem: 'Need to dump 3,000 lbs at 1,500 lbs/min. How long?',
      steps: [
        { step: 'Time = Fuel ÷ Rate', explanation: 'Use the time formula' },
        { step: '3,000 ÷ 1,500 = 2', explanation: 'Divide fuel by rate' }
      ],
      answer: '2 minutes',
      tip: 'This is just a rate problem: Amount = Rate × Time, rearranged as needed'
    }
  },
  'magnetic-compass': {
    name: '🧲 Magnetic Compass',
    description: 'Compass error corrections for turns',
    formula: 'UNOS: Undershoot North, Overshoot South. Add latitude to lead/lag.',
    example: {
      problem: 'At 30°N latitude, rolling out on 360° (North). What lead point?',
      steps: [
        { step: 'Target is North (360°)', explanation: 'UNOS says Undershoot North' },
        { step: 'Normal lead point = 15°', explanation: 'Standard rollout lead' },
        { step: 'Add latitude: 15 + 30 = 45°', explanation: 'Latitude compensation' },
        { step: 'Undershoot by 45°', explanation: 'Start rollout early' }
      ],
      answer: 'Begin rollout at 315° (45° before target)',
      tip: 'UNOS = Undershoot North, Overshoot South. ANDS = Accelerate North, Decelerate South (on E/W headings only)'
    }
  },
  'sixty-to-one': {
    name: '📐 60-to-1 Rule',
    description: 'Calculate arc distance or radials crossed',
    formula: 'At 60 NM: 1° = 1 NM. Radials per mile = 60 ÷ DME',
    example: {
      problem: 'At 30 DME, how many NM between radials 10° apart?',
      steps: [
        { step: 'At 60 NM: 1° = 1 NM', explanation: 'The base 60-to-1 rule' },
        { step: 'At 30 NM: 1° = 0.5 NM', explanation: 'Half the distance = half the arc' },
        { step: '10° × 0.5 = 5 NM', explanation: 'Arc distance' }
      ],
      answer: '5 NM',
      tip: 'Quick formula: Arc = (DME × degrees) ÷ 60. Or: Degrees per NM = 60 ÷ DME'
    }
  },
  'standard-rate-turn': {
    name: '🔃 Standard Rate Turn',
    description: 'Calculate bank angle for 3°/sec turn',
    formula: 'Bank Angle = (TAS ÷ 10) × 1.5 (max 30° for IFR)',
    example: {
      problem: 'TAS is 140 knots. What bank angle for standard rate?',
      steps: [
        { step: '140 ÷ 10 = 14', explanation: 'Divide TAS by 10' },
        { step: '14 × 1.5 = 21°', explanation: 'Multiply by 1.5' }
      ],
      answer: '21° bank',
      tip: 'Alternative: Bank = TAS ÷ 10 + 5. For 140 kts: 14 + 7 = 21°. Same result!'
    }
  },
  'turn-radius': {
    name: '⭕ Turn Radius',
    description: 'Calculate turn radius in nautical miles',
    formula: 'Turn Radius = TAS ÷ 200  |  Or: (Mach × 10) - 2 at high speed',
    example: {
      problem: 'TAS 180 knots. What is the turn radius?',
      steps: [
        { step: '180 ÷ 200', explanation: 'Divide TAS by 200' },
        { step: '180 ÷ 200 = 0.9 NM', explanation: 'Turn radius' }
      ],
      answer: '0.9 NM radius',
      tip: 'At 120 kts: 0.6 NM radius. At 180 kts: 0.9 NM. At 240 kts: 1.2 NM.'
    }
  },
  'true-airspeed': {
    name: '✈️ True Airspeed',
    description: 'Calculate TAS from IAS and altitude',
    formula: 'TAS = IAS + (IAS × Altitude in 1000s × 2%)',
    example: {
      problem: 'IAS 150 knots at 10,000 ft. What is TAS?',
      steps: [
        { step: 'Altitude = 10 (thousands)', explanation: '10,000 ÷ 1000' },
        { step: '10 × 2% = 20%', explanation: '2% per thousand feet' },
        { step: '150 × 0.20 = 30', explanation: '20% of IAS' },
        { step: '150 + 30 = 180', explanation: 'Add to IAS' }
      ],
      answer: '180 knots TAS',
      tip: 'Rule of thumb: Add 2% to IAS for every 1,000 ft of altitude'
    }
  },
  'time-speed-distance': {
    name: '🏎️ Time-Speed-Distance',
    description: 'Calculate time, speed, or distance',
    formula: 'Distance = Ground Speed × Time. 60 knots = 1 NM/min',
    example: {
      problem: 'Ground speed 150 knots, distance 50 NM. How long?',
      steps: [
        { step: '150 kts = 2.5 NM/min', explanation: '150 ÷ 60 = 2.5' },
        { step: '50 ÷ 2.5 = 20 minutes', explanation: 'Distance ÷ rate' }
      ],
      answer: '20 minutes',
      tip: 'Convert GS to NM/min first (÷60), then divide distance by that rate'
    }
  },
  'descent-planning': {
    name: '📉 Descent Planning',
    description: 'Calculate top of descent distance',
    formula: '3-to-1 Rule: Distance = Altitude to lose (in 1000s) × 3',
    example: {
      problem: 'Cruise at FL350, descend to 5,000 ft. Where to start?',
      steps: [
        { step: '35,000 - 5,000 = 30,000 ft', explanation: 'Altitude to lose' },
        { step: '30,000 ÷ 1000 = 30', explanation: 'In thousands' },
        { step: '30 × 3 = 90 NM', explanation: '3 NM per 1000 ft' }
      ],
      answer: 'Begin descent 90 NM out',
      tip: 'The 3-to-1 gives ~3° descent path. Add 10 NM for deceleration on jets.'
    }
  },
  'visual-descent-point': {
    name: '🛬 Visual Descent Point',
    description: 'Calculate VDP distance or timing for non-precision approaches',
    formula: 'VDP DME = (HAT ÷ 300) + Threshold DME | VDP Time = Approach Time - (HAT ÷ 10)',
    example: {
      problem: 'MDA HAT is 400 ft, threshold at 1.5 DME. What is the VDP?',
      steps: [
        { step: 'HAT ÷ 300 = 400 ÷ 300', explanation: 'Distance needed for 3° descent (300 ft/NM)' },
        { step: '400 ÷ 300 = 1.3 NM', explanation: 'Distance from threshold to begin descent' },
        { step: '1.3 + 1.5 = 2.8 DME', explanation: 'Add threshold DME' }
      ],
      answer: '2.8 DME',
      tip: 'For timing method: HAT ÷ 10 = seconds before MAP (assumes 600 fpm descent rate)'
    }
  },
  'glide-distance': {
    name: '🛩️ Glide Distance',
    description: 'Calculate glide distance for engine-out scenarios',
    formula: 'Glide Distance = (Altitude ÷ 6000) × Glide Ratio. 6,000 ft = 1 NM vertically',
    example: {
      problem: 'At 18,000 ft with 15:1 glide ratio. How far can you glide?',
      steps: [
        { step: '18,000 ÷ 6,000 = 3', explanation: '6,000 ft = 1 NM vertically, so 18,000 ft = 3 NM of altitude' },
        { step: '3 × 15 = 45 NM', explanation: 'Multiply vertical NM by glide ratio' }
      ],
      answer: '45 NM',
      tip: 'Common glide ratios: Cessna 172 ≈ 9:1, Jet ≈ 15-17:1. Headwind reduces range, tailwind extends it.'
    }
  },
  'cloud-base': {
    name: '☁️ Cloud Base',
    description: 'Estimate cloud base height from dew point spread',
    formula: 'Cloud Base (ft AGL) = Dew Point Spread (°C) × 400',
    example: {
      problem: 'Temperature is 25°C, dew point is 15°C. What is the cloud base?',
      steps: [
        { step: '25 - 15 = 10°C', explanation: 'Calculate the dew point spread' },
        { step: '10 × 400 = 4,000 ft', explanation: 'Multiply spread by 400 ft per degree' }
      ],
      answer: '4,000 ft AGL',
      tip: 'Small spread (1-2°C) = low clouds/fog likely. Large spread (10°C+) = high clouds or clear. Allow ±200 ft margin.'
    }
  }
};
