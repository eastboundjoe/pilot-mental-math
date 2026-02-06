import { Problem, ProblemCategory, CATEGORY_INFO } from './types';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to get random int in range
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to pick random item from array
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ============================================
// PROBLEM GENERATORS
// ============================================

function generateHoursToDecimal(): Problem {
  const hours = randInt(0, 5);
  const minutes = pick([0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57]);
  const decimalHours = hours + minutes / 60;

  return {
    id: generateId(),
    category: 'hours-to-decimal',
    question: `Convert ${hours}:${minutes.toString().padStart(2, '0')} to decimal hours`,
    correctAnswer: Math.round(decimalHours * 100) / 100,
    tolerance: 0.01,
    unit: 'hours',
    hint: 'Every 6 minutes = 0.1 hour',
    explanation: `${hours}:${minutes.toString().padStart(2, '0')} = ${hours} + (${minutes}/60) = ${decimalHours.toFixed(2)} hours`
  };
}

function generateReciprocalHeading(): Problem {
  const heading = randInt(1, 360);
  let reciprocal: number;

  if (heading <= 180) {
    reciprocal = heading + 180;
  } else {
    reciprocal = heading - 180;
  }

  return {
    id: generateId(),
    category: 'reciprocal-heading',
    question: `What is the reciprocal of heading ${heading.toString().padStart(3, '0')}°?`,
    correctAnswer: reciprocal,
    tolerance: 0,
    unit: '°',
    hint: 'Add 200, subtract 20 (or vice versa)',
    explanation: heading <= 180
      ? `${heading}° + 200 - 20 = ${reciprocal}°`
      : `${heading}° - 200 + 20 = ${reciprocal}°`
  };
}

function generateHydroplaning(): Problem {
  const tirePressures = [50, 80, 100, 120, 144, 150, 169, 180, 196, 200, 225];
  const pressure = pick(tirePressures);
  const speed = 9 * Math.sqrt(pressure);

  return {
    id: generateId(),
    category: 'hydroplaning',
    question: `Main tire pressure is ${pressure} psi. What is the hydroplaning speed?`,
    correctAnswer: Math.round(speed),
    tolerance: 2,
    unit: 'knots',
    hint: 'V = 9 × √(tire pressure)',
    explanation: `V = 9 × √${pressure} = 9 × ${Math.sqrt(pressure).toFixed(1)} = ${Math.round(speed)} knots`
  };
}

function generateTempConversion(): Problem {
  const toFahrenheit = Math.random() > 0.5;

  if (toFahrenheit) {
    const celsius = pick([-40, -30, -20, -10, 0, 5, 10, 15, 20, 25, 30, 35, 40]);
    const fahrenheit = (celsius * 9/5) + 32;

    return {
      id: generateId(),
      category: 'temp-conversion',
      question: `Convert ${celsius}°C to Fahrenheit`,
      correctAnswer: Math.round(fahrenheit),
      tolerance: 2,
      unit: '°F',
      hint: 'Double it, subtract 10%, add 32',
      explanation: `${celsius}°C × 2 = ${celsius * 2}, -10% = ${celsius * 2 * 0.9}, +32 = ${Math.round(fahrenheit)}°F`
    };
  } else {
    const fahrenheit = pick([14, 32, 41, 50, 59, 68, 77, 86, 95, 104]);
    const celsius = (fahrenheit - 32) * 5/9;

    return {
      id: generateId(),
      category: 'temp-conversion',
      question: `Convert ${fahrenheit}°F to Celsius`,
      correctAnswer: Math.round(celsius),
      tolerance: 2,
      unit: '°C',
      hint: 'Subtract 32, add 10%, divide by 2',
      explanation: `(${fahrenheit}°F - 32) × 5/9 = ${Math.round(celsius)}°C`
    };
  }
}

function generateISADeviation(): Problem {
  const altitudes = [5000, 8000, 10000, 15000, 18000, 21000, 25000, 30000, 35000];
  const altitude = pick(altitudes);
  const isaTemp = 15 - (altitude / 1000) * 2;
  const actualTemp = isaTemp + randInt(-20, 20);
  const deviation = actualTemp - isaTemp;

  const questionType = Math.random() > 0.5 ? 'isa' : 'deviation';

  if (questionType === 'isa') {
    return {
      id: generateId(),
      category: 'isa-deviation',
      question: `What is the ISA temperature at ${altitude.toLocaleString()} feet MSL?`,
      correctAnswer: isaTemp,
      tolerance: 0,
      unit: '°C',
      hint: 'ISA = 15°C - (altitude in 1000s × 2)',
      explanation: `ISA = 15 - (${altitude/1000} × 2) = 15 - ${(altitude/1000)*2} = ${isaTemp}°C`
    };
  } else {
    return {
      id: generateId(),
      category: 'isa-deviation',
      question: `At ${altitude.toLocaleString()} feet, OAT is ${actualTemp}°C. What is the ISA deviation?`,
      correctAnswer: deviation,
      tolerance: 0,
      unit: '°C',
      hint: 'First find ISA temp, then: Deviation = Actual - ISA',
      explanation: `ISA at ${altitude/1000}K = ${isaTemp}°C. Deviation = ${actualTemp} - ${isaTemp} = ${deviation > 0 ? '+' : ''}${deviation}°C`
    };
  }
}

function generatePressureAltitude(): Problem {
  const altimeterSettings = [29.42, 29.52, 29.62, 29.72, 29.82, 29.92, 30.02, 30.12, 30.22, 30.32, 30.42, 30.52];
  const setting = pick(altimeterSettings);
  const fieldElevation = pick([0, 250, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000]);

  const difference = 29.92 - setting;
  const correction = difference * 1000; // 10 feet per 0.01 inHg
  const pressureAlt = fieldElevation + correction;

  return {
    id: generateId(),
    category: 'pressure-altitude',
    question: `Field elevation is ${fieldElevation.toLocaleString()} ft, altimeter setting is ${setting.toFixed(2)}" Hg. What is the pressure altitude?`,
    correctAnswer: Math.round(pressureAlt),
    tolerance: 20,
    unit: 'feet',
    hint: '10 feet per 0.01" from 29.92',
    explanation: `Difference from 29.92: ${(difference).toFixed(2)}" = ${Math.round(correction)} ft. PA = ${fieldElevation} + ${Math.round(correction)} = ${Math.round(pressureAlt)} ft`
  };
}

function generateCrosswind(): Problem {
  const windSpeeds = [10, 12, 15, 18, 20, 22, 25, 28, 30, 35];
  const windSpeed = pick(windSpeeds);
  const angles = [15, 20, 30, 40, 45, 50, 60, 70, 75, 90];
  const angle = pick(angles);

  // Using sine for exact crosswind, but book uses approximations
  const crosswind = windSpeed * Math.sin(angle * Math.PI / 180);

  // Round to reasonable precision
  const roundedCrosswind = Math.round(crosswind);

  return {
    id: generateId(),
    category: 'crosswind',
    question: `Wind is ${windSpeed} knots at ${angle}° off the runway. What is the crosswind component?`,
    correctAnswer: roundedCrosswind,
    tolerance: 2,
    unit: 'knots',
    hint: '30°=50%, 45°=70%, 60°=90%, 90°=100%',
    explanation: `At ${angle}° angle: crosswind ≈ ${roundedCrosswind} knots (${Math.round(crosswind/windSpeed*100)}% of ${windSpeed} kts)`
  };
}

function generateHeadwindTailwind(): Problem {
  const windSpeeds = [10, 15, 20, 25, 30, 35, 40];
  const windSpeed = pick(windSpeeds);
  const angles = [0, 15, 20, 30, 40, 45, 50, 60];
  const angle = pick(angles);
  const isHeadwind = Math.random() > 0.5;

  const component = windSpeed * Math.cos(angle * Math.PI / 180);

  return {
    id: generateId(),
    category: 'headwind-tailwind',
    question: `Wind is ${windSpeed} knots at ${angle}° off the runway. What is the ${isHeadwind ? 'headwind' : 'tailwind'} component?`,
    correctAnswer: Math.round(component),
    tolerance: 2,
    unit: 'knots',
    hint: '0°=100%, 30°=90%, 45°=70%, 60°=50%',
    explanation: `At ${angle}° angle: ${isHeadwind ? 'headwind' : 'tailwind'} ≈ ${Math.round(component)} knots (${Math.round(component/windSpeed*100)}% of ${windSpeed} kts)`
  };
}

function generateDriftAngle(): Problem {
  const tasOptions = [90, 120, 150, 180, 240, 300, 360, 420, 480];
  const tas = pick(tasOptions);
  const crosswindOptions = [6, 8, 10, 12, 15, 18, 20, 24, 30, 36, 40, 48];
  const crosswind = pick(crosswindOptions.filter(c => c <= tas / 4)); // Keep drift reasonable

  const drift = (crosswind * 60) / tas;

  return {
    id: generateId(),
    category: 'drift-angle',
    question: `At ${tas} KTAS with a ${crosswind}-knot crosswind, what is your drift angle?`,
    correctAnswer: Math.round(drift),
    tolerance: 1,
    unit: '°',
    hint: 'Drift = (Crosswind × 60) ÷ TAS',
    explanation: `Drift = (${crosswind} × 60) ÷ ${tas} = ${(crosswind * 60)} ÷ ${tas} = ${drift.toFixed(1)}°`
  };
}

function generateUnitConversion(): Problem {
  const conversionTypes = ['nm-to-sm', 'sm-to-nm', 'knots-to-mph', 'mph-to-knots', 'knots-to-nm-min'];
  const type = pick(conversionTypes);

  switch (type) {
    case 'nm-to-sm': {
      const nm = pick([50, 75, 100, 150, 200, 250, 300]);
      const sm = nm * 1.15;
      return {
        id: generateId(),
        category: 'unit-conversion',
        question: `Convert ${nm} nautical miles to statute miles`,
        correctAnswer: Math.round(sm),
        tolerance: 3,
        unit: 'SM',
        hint: '1 NM = 1.15 SM',
        explanation: `${nm} NM × 1.15 = ${Math.round(sm)} SM`
      };
    }
    case 'sm-to-nm': {
      const sm = pick([50, 75, 100, 150, 200, 250, 300]);
      const nm = sm / 1.15;
      return {
        id: generateId(),
        category: 'unit-conversion',
        question: `Convert ${sm} statute miles to nautical miles`,
        correctAnswer: Math.round(nm),
        tolerance: 3,
        unit: 'NM',
        hint: '1 SM = 0.87 NM',
        explanation: `${sm} SM ÷ 1.15 = ${Math.round(nm)} NM`
      };
    }
    case 'knots-to-mph': {
      const knots = pick([100, 150, 200, 250, 300, 350, 400]);
      const mph = knots * 1.15;
      return {
        id: generateId(),
        category: 'unit-conversion',
        question: `Convert ${knots} knots to miles per hour`,
        correctAnswer: Math.round(mph),
        tolerance: 5,
        unit: 'MPH',
        hint: '1 knot = 1.15 MPH',
        explanation: `${knots} knots × 1.15 = ${Math.round(mph)} MPH`
      };
    }
    case 'mph-to-knots': {
      const mph = pick([100, 150, 200, 250, 300, 350, 400]);
      const knots = mph / 1.15;
      return {
        id: generateId(),
        category: 'unit-conversion',
        question: `Convert ${mph} MPH to knots`,
        correctAnswer: Math.round(knots),
        tolerance: 5,
        unit: 'knots',
        hint: '1 MPH = 0.87 knots',
        explanation: `${mph} MPH ÷ 1.15 = ${Math.round(knots)} knots`
      };
    }
    default: {
      const knots = pick([60, 90, 120, 180, 240, 300, 360, 420, 480]);
      const nmPerMin = knots / 60;
      return {
        id: generateId(),
        category: 'unit-conversion',
        question: `At ${knots} knots, how many nautical miles per minute?`,
        correctAnswer: nmPerMin,
        tolerance: 0.1,
        unit: 'NM/min',
        hint: '60 knots = 1 NM/min',
        explanation: `${knots} knots ÷ 60 = ${nmPerMin} NM/min`
      };
    }
  }
}

function generateVisibilityRVR(): Problem {
  const visibilities: [number, string, number][] = [
    [0.25, '1/4', 1600],
    [0.5, '1/2', 2400],
    [0.75, '3/4', 4000],
    [1, '1', 5000],
    [1.5, '1 1/2', 6000]
  ];

  const [vis, visString, rvr] = pick(visibilities);

  return {
    id: generateId(),
    category: 'visibility-rvr',
    question: `What is the RVR equivalent of ${visString} statute mile visibility?`,
    correctAnswer: rvr,
    tolerance: 0,
    unit: 'feet',
    hint: '1/4=1600, 1/2=2400, 3/4=4000, 1=5000, 1.5=6000',
    explanation: `${visString} SM = ${rvr} feet RVR`
  };
}

function generateFuelWeight(): Problem {
  const fuelTypes = ['avgas', 'jetA'] as const;
  const fuelType = pick(fuelTypes);
  const toWeight = Math.random() > 0.5;

  const lbsPerGal = fuelType === 'avgas' ? 6.0 : 6.7;
  const fuelName = fuelType === 'avgas' ? 'Avgas' : 'Jet A';

  if (toWeight) {
    const gallons = pick([50, 75, 100, 150, 200, 250, 300, 400, 500]);
    const pounds = gallons * lbsPerGal;
    return {
      id: generateId(),
      category: 'fuel-weight',
      question: `How many pounds is ${gallons} gallons of ${fuelName}?`,
      correctAnswer: Math.round(pounds),
      tolerance: 10,
      unit: 'lbs',
      hint: `${fuelName}: ${lbsPerGal} lbs/gal`,
      explanation: `${gallons} gal × ${lbsPerGal} lbs/gal = ${Math.round(pounds)} lbs`
    };
  } else {
    const pounds = pick([300, 500, 750, 1000, 1500, 2000, 3000, 5000]);
    const gallons = pounds / lbsPerGal;
    return {
      id: generateId(),
      category: 'fuel-weight',
      question: `How many gallons is ${pounds.toLocaleString()} lbs of ${fuelName}?`,
      correctAnswer: Math.round(gallons),
      tolerance: 5,
      unit: 'gallons',
      hint: `${fuelName}: ${lbsPerGal} lbs/gal`,
      explanation: `${pounds} lbs ÷ ${lbsPerGal} lbs/gal = ${Math.round(gallons)} gallons`
    };
  }
}

function generateFuelDumping(): Problem {
  const dumpRates = [1200, 1500, 2000, 2200, 2500, 3000];
  const dumpRate = pick(dumpRates);
  const solveFor = pick(['time', 'fuel'] as const);

  if (solveFor === 'time') {
    const fuelMultipliers = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20];
    const time = pick(fuelMultipliers);
    const fuel = dumpRate * time;

    return {
      id: generateId(),
      category: 'fuel-dumping',
      question: `Dump rate is ${dumpRate.toLocaleString()} lbs/min. How long to dump ${fuel.toLocaleString()} lbs?`,
      correctAnswer: time,
      tolerance: 0.5,
      unit: 'minutes',
      hint: 'Time = Fuel ÷ Rate',
      explanation: `${fuel.toLocaleString()} lbs ÷ ${dumpRate.toLocaleString()} lbs/min = ${time} minutes`
    };
  } else {
    const times = [5, 6, 7, 8, 10, 12, 15];
    const time = pick(times);
    const fuel = dumpRate * time;

    return {
      id: generateId(),
      category: 'fuel-dumping',
      question: `Dump rate is ${dumpRate.toLocaleString()} lbs/min. How much fuel dumped in ${time} minutes?`,
      correctAnswer: fuel,
      tolerance: 100,
      unit: 'lbs',
      hint: 'Fuel = Rate × Time',
      explanation: `${dumpRate.toLocaleString()} lbs/min × ${time} min = ${fuel.toLocaleString()} lbs`
    };
  }
}

function generateMagneticCompass(): Problem {
  const startHeadings = [90, 180, 270, 360];
  const startHeading = pick(startHeadings);
  const bankAngles = [15, 20, 25];
  const bankAngle = pick(bankAngles);
  const latitudes = [30, 35, 40, 45];
  const latitude = pick(latitudes);

  const directions: ('north' | 'south')[] = ['north', 'south'];
  const turningTo = pick(directions);
  const turnDirections = ['left', 'right'] as const;
  const turnDirection = pick(turnDirections);

  // Normal lead point is bank/3
  const normalLead = Math.round(bankAngle / 3);
  // For north, undershoot (start rollout early)
  // For south, overshoot (start rollout late)

  let desiredHeading: number;
  if (turningTo === 'north') {
    desiredHeading = pick([350, 355, 360, 5, 10, 15]);
    if (desiredHeading === 360) desiredHeading = 360;
  } else {
    desiredHeading = pick([165, 170, 175, 180, 185, 190, 195]);
  }

  // Lead point calculation with latitude correction
  const totalLead = normalLead + latitude;
  let rolloutHeading: number;

  if (turningTo === 'north') {
    // Undershoot north - roll out early (before the heading)
    rolloutHeading = desiredHeading - totalLead;
    if (rolloutHeading <= 0) rolloutHeading += 360;
  } else {
    // Overshoot south - roll out late (after the heading)
    rolloutHeading = desiredHeading + totalLead;
    if (rolloutHeading > 360) rolloutHeading -= 360;
  }

  return {
    id: generateId(),
    category: 'magnetic-compass',
    question: `Using magnetic compass only at ${latitude}°N, turning ${turnDirection} to ${desiredHeading === 360 ? '360' : desiredHeading}° with ${bankAngle}° bank. At what compass reading do you start rollout?`,
    correctAnswer: Math.round(rolloutHeading),
    tolerance: 3,
    unit: '°',
    hint: 'UNOS: Undershoot North, Overshoot South. Lead = (bank÷3) + latitude',
    explanation: `Lead = ${normalLead}° + ${latitude}° latitude = ${totalLead}°. ${turningTo === 'north' ? 'Undershoot' : 'Overshoot'}: ${desiredHeading}° ${turningTo === 'north' ? '-' : '+'} ${totalLead}° = ${Math.round(rolloutHeading)}°`
  };
}

function generateSixtyToOne(): Problem {
  const dmes = [10, 12, 15, 20, 30, 45, 60];
  const dme = pick(dmes);
  const questionType = pick(['radials-per-mile', 'arc-distance'] as const);

  if (questionType === 'radials-per-mile') {
    const radialsPerMile = 60 / dme;
    return {
      id: generateId(),
      category: 'sixty-to-one',
      question: `At ${dme} DME, how many radials per nautical mile?`,
      correctAnswer: radialsPerMile,
      tolerance: 0.5,
      unit: 'radials/NM',
      hint: 'Radials per mile = 60 ÷ DME',
      explanation: `60 ÷ ${dme} = ${radialsPerMile} radials per NM`
    };
  } else {
    const radialsCrossed = pick([20, 24, 30, 36, 40, 45, 50, 60]);
    const arcDistance = radialsCrossed / (60 / dme);
    return {
      id: generateId(),
      category: 'sixty-to-one',
      question: `Flying a ${dme} NM arc, crossing ${radialsCrossed} radials. What is the arc distance?`,
      correctAnswer: Math.round(arcDistance * 10) / 10,
      tolerance: 0.5,
      unit: 'NM',
      hint: 'Arc distance = Radials ÷ (60 ÷ DME)',
      explanation: `Radials per NM = ${60/dme}. Arc = ${radialsCrossed} ÷ ${60/dme} = ${arcDistance.toFixed(1)} NM`
    };
  }
}

function generateStandardRateTurn(): Problem {
  const tasOptions = [90, 100, 120, 150, 180, 200, 240, 280];
  const tas = pick(tasOptions);
  const bankAngle = Math.min(30, (tas / 10) * 1.5);

  return {
    id: generateId(),
    category: 'standard-rate-turn',
    question: `What bank angle for a standard rate turn at ${tas} KTAS?`,
    correctAnswer: Math.round(bankAngle),
    tolerance: 1,
    unit: '°',
    hint: 'Bank = (TAS ÷ 10) × 1.5, max 30° IFR',
    explanation: `(${tas} ÷ 10) × 1.5 = ${((tas/10)*1.5).toFixed(1)}°${bankAngle === 30 ? ' → limited to 30° for IFR' : ''}`
  };
}

function generateTurnRadius(): Problem {
  const tasOptions = [90, 100, 120, 150, 180, 200, 240];
  const tas = pick(tasOptions);
  const radius = tas / 200;

  return {
    id: generateId(),
    category: 'turn-radius',
    question: `At ${tas} KTAS in a standard rate turn, what is the turn radius?`,
    correctAnswer: Math.round(radius * 10) / 10,
    tolerance: 0.1,
    unit: 'NM',
    hint: 'Turn Radius = TAS ÷ 200',
    explanation: `${tas} ÷ 200 = ${radius.toFixed(1)} NM`
  };
}

function generateTrueAirspeed(): Problem {
  const iasOptions = [100, 120, 140, 160, 180, 200, 250, 280];
  const ias = pick(iasOptions);
  const altitudes = [5000, 8000, 10000, 12000, 15000, 18000, 20000, 25000];
  const altitude = pick(altitudes);

  const correction = ias * (altitude / 1000) * 0.02;
  const tas = ias + correction;

  return {
    id: generateId(),
    category: 'true-airspeed',
    question: `At ${altitude.toLocaleString()} ft MSL, IAS is ${ias} knots. What is your TAS?`,
    correctAnswer: Math.round(tas),
    tolerance: 3,
    unit: 'knots',
    hint: 'TAS = IAS + (IAS × altitude in 1000s × 2%)',
    explanation: `Correction = ${ias} × ${altitude/1000} × 0.02 = ${Math.round(correction)} kts. TAS = ${ias} + ${Math.round(correction)} = ${Math.round(tas)} kts`
  };
}

function generateTimeSpeedDistance(): Problem {
  const questionType = pick(['time', 'distance', 'speed'] as const);

  if (questionType === 'distance') {
    const groundSpeeds = [120, 150, 180, 210, 240, 300, 360, 420, 480];
    const gs = pick(groundSpeeds);
    const times = [5, 6, 8, 10, 12, 15, 20, 25, 30];
    const time = pick(times);
    const distance = (gs / 60) * time;

    return {
      id: generateId(),
      category: 'time-speed-distance',
      question: `At ${gs} knots ground speed, how far do you travel in ${time} minutes?`,
      correctAnswer: Math.round(distance),
      tolerance: 2,
      unit: 'NM',
      hint: 'Distance = (GS ÷ 60) × Time in minutes',
      explanation: `${gs} kts = ${gs/60} NM/min. ${gs/60} × ${time} min = ${Math.round(distance)} NM`
    };
  } else if (questionType === 'time') {
    const groundSpeeds = [120, 150, 180, 210, 240, 300, 360, 420, 480];
    const gs = pick(groundSpeeds);
    const distances = [20, 30, 40, 50, 60, 80, 100, 120];
    const distance = pick(distances);
    const time = distance / (gs / 60);

    return {
      id: generateId(),
      category: 'time-speed-distance',
      question: `At ${gs} knots, how long to travel ${distance} NM?`,
      correctAnswer: Math.round(time),
      tolerance: 1,
      unit: 'minutes',
      hint: 'Time = Distance ÷ (GS ÷ 60)',
      explanation: `${gs} kts = ${gs/60} NM/min. ${distance} NM ÷ ${gs/60} = ${Math.round(time)} minutes`
    };
  } else {
    const times = [10, 12, 15, 20, 24, 30, 40, 45];
    const time = pick(times);
    const distances = [30, 40, 50, 60, 80, 100, 120, 150];
    const distance = pick(distances);
    const gs = (distance / time) * 60;

    return {
      id: generateId(),
      category: 'time-speed-distance',
      question: `You traveled ${distance} NM in ${time} minutes. What is your ground speed?`,
      correctAnswer: Math.round(gs),
      tolerance: 5,
      unit: 'knots',
      hint: 'GS = (Distance ÷ Time) × 60',
      explanation: `${distance} ÷ ${time} = ${(distance/time).toFixed(1)} NM/min × 60 = ${Math.round(gs)} knots`
    };
  }
}

function generateDescentPlanning(): Problem {
  const questionType = pick(['distance', 'top-of-descent', 'descent-rate', 'pitch-angle', 'altitude-at-distance'] as const);

  if (questionType === 'distance') {
    const altitudesToLose = [6, 8, 10, 12, 15, 18, 20, 24, 30];
    const altToLose = pick(altitudesToLose);
    const distance = altToLose * 3;

    return {
      id: generateId(),
      category: 'descent-planning',
      question: `You need to descend ${altToLose},000 feet. Using 3-to-1 rule, how many NM needed?`,
      correctAnswer: distance,
      tolerance: 0,
      unit: 'NM',
      hint: '3-to-1: Distance = Altitude (1000s) × 3',
      explanation: `${altToLose} × 3 = ${distance} NM`
    };
  } else if (questionType === 'top-of-descent') {
    const cruiseAltitudes = [25000, 28000, 31000, 35000, 37000, 39000];
    const cruiseAlt = pick(cruiseAltitudes);
    const targetAltitudes = [8000, 10000, 11000, 12000];
    const targetAlt = pick(targetAltitudes);
    const restrictionDMEs = [15, 20, 25, 30];
    const restrictionDME = pick(restrictionDMEs);

    const altToLose = (cruiseAlt - targetAlt) / 1000;
    const descentDistance = altToLose * 3;
    const topOfDescent = restrictionDME + descentDistance;

    return {
      id: generateId(),
      category: 'descent-planning',
      question: `Cruising at FL${cruiseAlt/100}, need to cross ${restrictionDME} DME at ${(targetAlt/1000).toFixed(0)},000 ft. At what DME start descent?`,
      correctAnswer: Math.round(topOfDescent),
      tolerance: 2,
      unit: 'DME',
      hint: '3-to-1: Distance = Altitude (1000s) × 3, then add restriction DME',
      explanation: `Lose ${altToLose}K ft × 3 = ${descentDistance} NM. Start at ${restrictionDME} + ${descentDistance} = ${topOfDescent} DME`
    };
  } else if (questionType === 'descent-rate') {
    // Descent Rate: Ground Speed × 5 = FPM for 3° descent
    const groundSpeeds = [100, 120, 140, 150, 160, 180, 200, 220, 240, 280, 300];
    const gs = pick(groundSpeeds);
    const descentRate = gs * 5;

    return {
      id: generateId(),
      category: 'descent-planning',
      question: `Flying a 3° descent at ${gs} knots ground speed. What descent rate is required?`,
      correctAnswer: descentRate,
      tolerance: 10,
      unit: 'fpm',
      hint: 'Descent Rate = Ground Speed × 5',
      explanation: `${gs} kts × 5 = ${descentRate} fpm`
    };
  } else if (questionType === 'pitch-angle') {
    // Pitch angle = Altitude (ft) / (Distance × 100)
    const scenarios: { alt: number; dist: number }[] = [
      { alt: 5000, dist: 10 },
      { alt: 4000, dist: 20 },
      { alt: 7000, dist: 28 },
      { alt: 6000, dist: 20 },
      { alt: 8000, dist: 40 },
      { alt: 10000, dist: 50 },
      { alt: 12000, dist: 40 },
      { alt: 15000, dist: 50 },
      { alt: 19000, dist: 35 },
      { alt: 23000, dist: 70 },
    ];
    const scenario = pick(scenarios);
    const pitchAngle = scenario.alt / (scenario.dist * 100);

    return {
      id: generateId(),
      category: 'descent-planning',
      question: `Descend ${scenario.alt.toLocaleString()} ft over ${scenario.dist} NM. What pitch angle is needed?`,
      correctAnswer: Math.round(pitchAngle * 10) / 10,
      tolerance: 0.3,
      unit: '° nose down',
      hint: 'Pitch = Altitude ÷ (Distance × 100)',
      explanation: `${scenario.alt.toLocaleString()} ÷ (${scenario.dist} × 100) = ${pitchAngle.toFixed(1)}° nose down`
    };
  } else {
    // Visual approach: What altitude at X distance for 3° glidepath
    // 300 ft per NM or 333 ft per NM (book uses both)
    const distances = [3, 4, 5, 6, 8, 10, 12];
    const distance = pick(distances);
    const fieldElevations = [0, 500, 1000, 1500, 2000, 3000, 5000];
    const fieldElev = pick(fieldElevations);

    // Using 300 ft/NM for 3° glidepath
    const agl = distance * 300;
    const msl = agl + fieldElev;

    return {
      id: generateId(),
      category: 'descent-planning',
      question: `Visual approach, field elevation ${fieldElev.toLocaleString()}' MSL. What altitude at ${distance} NM for 3° glidepath?`,
      correctAnswer: Math.round(msl),
      tolerance: 100,
      unit: 'ft MSL',
      hint: '3° glidepath ≈ 300 ft/NM. Altitude = (Distance × 300) + Field Elevation',
      explanation: `${distance} NM × 300 ft/NM = ${agl}' AGL. ${agl} + ${fieldElev}' = ${msl}' MSL`
    };
  }
}

// ============================================
// VISUAL DESCENT POINT
// ============================================

function generateVisualDescentPoint(): Problem {
  const questionType = pick(['dme', 'timing']);

  if (questionType === 'dme') {
    // HAT values typically between 300 and 600 feet
    const hatValues = [300, 350, 390, 400, 450, 480, 500, 550, 600];
    const hat = pick(hatValues);
    // Threshold DME typically between 1 and 3 NM
    const thresholdDMEs = [1.0, 1.2, 1.5, 1.6, 1.8, 2.0, 2.2, 2.5];
    const thresholdDME = pick(thresholdDMEs);

    // VDP = (HAT / 300) + Threshold DME
    // 300 ft/NM is the standard 3° glidepath
    const descentDistance = hat / 300;
    const vdpDME = descentDistance + thresholdDME;

    return {
      id: generateId(),
      category: 'visual-descent-point',
      question: `MDA HAT is ${hat} ft, runway threshold at ${thresholdDME} DME. What is the VDP?`,
      correctAnswer: Math.round(vdpDME * 10) / 10,
      tolerance: 0.2,
      unit: 'DME',
      hint: 'VDP = (HAT ÷ 300) + Threshold DME',
      explanation: `HAT ${hat} ÷ 300 = ${(hat/300).toFixed(2)} NM descent distance. Add threshold ${thresholdDME} DME = ${vdpDME.toFixed(1)} DME`
    };
  } else {
    // Timing method: Time = Approach Time - (HAT / 10)
    const hatValues = [300, 350, 400, 450, 500];
    const hat = pick(hatValues);
    // Approach timing in seconds (from FAF to MAP)
    const approachTimings = [120, 135, 150, 165, 180, 195, 210];
    const approachTime = pick(approachTimings);

    // HAT / 10 gives seconds needed at 600 fpm descent
    const descentTime = hat / 10;
    const vdpTime = approachTime - descentTime;

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      id: generateId(),
      category: 'visual-descent-point',
      question: `HAT is ${hat} ft, approach timing is ${formatTime(approachTime)}. At what time from FAF is the VDP?`,
      correctAnswer: Math.round(vdpTime),
      tolerance: 5,
      unit: 'seconds',
      hint: 'VDP Time = Approach Time - (HAT ÷ 10)',
      explanation: `HAT ${hat} ÷ 10 = ${descentTime} sec descent time. ${formatTime(approachTime)} - ${descentTime} sec = ${formatTime(vdpTime)} (${vdpTime} sec)`
    };
  }
}

// ============================================
// GLIDE DISTANCE
// ============================================

function generateGlideDistance(): Problem {
  // Common altitudes for engine-out scenarios
  const altitudes = [6000, 9000, 12000, 15000, 18000, 21000, 24000, 30000, 36000];
  const altitude = pick(altitudes);

  // Common glide ratios for different aircraft types
  const glideRatios: { ratio: number; aircraft: string }[] = [
    { ratio: 9, aircraft: 'light single' },
    { ratio: 10, aircraft: 'training aircraft' },
    { ratio: 12, aircraft: 'light twin' },
    { ratio: 15, aircraft: 'turboprop' },
    { ratio: 17, aircraft: 'jet' },
  ];
  const glideInfo = pick(glideRatios);

  // Glide distance = (Altitude / 6000) × Glide Ratio
  // 6000 ft ≈ 1 NM vertically
  const altitudeInNM = altitude / 6000;
  const glideDistance = altitudeInNM * glideInfo.ratio;

  return {
    id: generateId(),
    category: 'glide-distance',
    question: `Engine failure at ${altitude.toLocaleString()} ft. With a ${glideInfo.ratio}:1 glide ratio (${glideInfo.aircraft}), how far can you glide?`,
    correctAnswer: Math.round(glideDistance),
    tolerance: 2,
    unit: 'NM',
    hint: 'Glide Distance = (Altitude ÷ 6,000) × Glide Ratio',
    explanation: `${altitude.toLocaleString()} ft ÷ 6,000 = ${altitudeInNM.toFixed(1)} NM altitude. ${altitudeInNM.toFixed(1)} × ${glideInfo.ratio} = ${Math.round(glideDistance)} NM`
  };
}

// ============================================
// CLOUD BASE ESTIMATION
// ============================================

function generateCloudBase(): Problem {
  // Realistic temperature/dewpoint combinations
  const temps = [15, 18, 20, 22, 25, 28, 30, 32, 35];
  const temp = pick(temps);

  // Dewpoint spread between 2 and 15 degrees (realistic range)
  const spreads = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15];
  const spread = pick(spreads);
  const dewpoint = temp - spread;

  // Cloud base = Spread × 400 ft (or 125 meters)
  const cloudBase = spread * 400;

  const questionType = pick(['calculate', 'from-metar'] as const);

  if (questionType === 'calculate') {
    return {
      id: generateId(),
      category: 'cloud-base',
      question: `Temperature ${temp}°C, dew point ${dewpoint}°C. Estimate the cloud base AGL.`,
      correctAnswer: cloudBase,
      tolerance: 200,
      unit: 'feet',
      hint: 'Cloud Base = Dew Point Spread × 400 ft',
      explanation: `Spread = ${temp} - ${dewpoint} = ${spread}°C. Cloud base = ${spread} × 400 = ${cloudBase.toLocaleString()} ft AGL`
    };
  } else {
    return {
      id: generateId(),
      category: 'cloud-base',
      question: `METAR shows ${temp}/${dewpoint.toString().padStart(2, '0')}. Estimate cumulus cloud bases.`,
      correctAnswer: cloudBase,
      tolerance: 200,
      unit: 'feet',
      hint: 'Cloud Base = (Temp - Dewpoint) × 400 ft',
      explanation: `Spread = ${temp} - ${dewpoint} = ${spread}°C. Cloud base ≈ ${spread} × 400 = ${cloudBase.toLocaleString()} ft AGL`
    };
  }
}

// ============================================
// HOLDING PATTERN
// ============================================

function generateHoldingPattern(): Problem {
  const questionType = pick(['outbound-heading', 'outbound-timing'] as const);

  if (questionType === 'outbound-heading') {
    // Calculate outbound heading with triple WCA
    const inboundCourses = [360, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const inboundCourse = pick(inboundCourses);
    const wcaValues = [4, 5, 6, 7, 8, 10, 12];
    const wca = pick(wcaValues);
    const windFromLeft = Math.random() > 0.5;

    // Outbound is opposite of inbound
    let outboundCourse = inboundCourse <= 180 ? inboundCourse + 180 : inboundCourse - 180;

    // Triple WCA on outbound
    // If wind from left on inbound, it's from right on outbound → correct right (add)
    // If wind from right on inbound, it's from left on outbound → correct left (subtract)
    const tripleWCA = wca * 3;
    let outboundHeading: number;

    if (windFromLeft) {
      // Wind from left on inbound = wind from right on outbound = add to heading
      outboundHeading = outboundCourse + tripleWCA;
    } else {
      // Wind from right on inbound = wind from left on outbound = subtract from heading
      outboundHeading = outboundCourse - tripleWCA;
    }

    // Normalize heading
    if (outboundHeading > 360) outboundHeading -= 360;
    if (outboundHeading <= 0) outboundHeading += 360;

    const windDirection = windFromLeft ? 'left' : 'right';
    const inboundDisplay = inboundCourse.toString().padStart(3, '0');

    return {
      id: generateId(),
      category: 'holding-pattern',
      question: `Holding inbound ${inboundDisplay}°, WCA is ${wca}° (wind from ${windDirection}). What is the outbound heading?`,
      correctAnswer: Math.round(outboundHeading),
      tolerance: 1,
      unit: '°',
      hint: 'Outbound heading = Reciprocal ± (3 × WCA). Triple correction compensates for turns.',
      explanation: `Outbound course = ${outboundCourse}°. Triple WCA = ${wca} × 3 = ${tripleWCA}°. ${outboundCourse}° ${windFromLeft ? '+' : '-'} ${tripleWCA}° = ${Math.round(outboundHeading)}°`
    };
  } else {
    // Timing correction for outbound leg
    const windSpeeds = [10, 15, 20, 25, 30];
    const windSpeed = pick(windSpeeds);
    const windTypes = ['direct-tail', 'quartering-tail', 'direct-head', 'quartering-head'] as const;
    const windType = pick(windTypes);

    let correction: number;
    let baseTime = 60; // Standard 1-minute outbound leg

    switch (windType) {
      case 'direct-tail':
        // Tailwind on outbound: subtract 1 sec per knot
        correction = -windSpeed;
        break;
      case 'quartering-tail':
        // Quartering tailwind: subtract 0.5 sec per knot
        correction = -Math.round(windSpeed * 0.5);
        break;
      case 'direct-head':
        // Headwind on outbound: add 1 sec per knot
        correction = windSpeed;
        break;
      case 'quartering-head':
        // Quartering headwind: add 0.5 sec per knot
        correction = Math.round(windSpeed * 0.5);
        break;
    }

    const outboundTime = baseTime + correction;

    const windDescription = {
      'direct-tail': 'direct tailwind',
      'quartering-tail': 'quartering tailwind (45°)',
      'direct-head': 'direct headwind',
      'quartering-head': 'quartering headwind (45°)'
    }[windType];

    const correctionRule = windType.includes('tail')
      ? (windType === 'direct-tail' ? '1 sec/kt' : '0.5 sec/kt')
      : (windType === 'direct-head' ? '1 sec/kt' : '0.5 sec/kt');

    return {
      id: generateId(),
      category: 'holding-pattern',
      question: `Holding with ${windSpeed} kt ${windDescription} on outbound leg. What outbound time for 1-min inbound?`,
      correctAnswer: outboundTime,
      tolerance: 2,
      unit: 'seconds',
      hint: `${windType.includes('tail') ? 'Tailwind: subtract' : 'Headwind: add'} ${correctionRule}`,
      explanation: `${windType.includes('tail') ? 'Tailwind shortens' : 'Headwind lengthens'} outbound. ${windSpeed} kt × ${windType.includes('quartering') ? '0.5' : '1'} = ${Math.abs(correction)} sec. 60 ${correction >= 0 ? '+' : '-'} ${Math.abs(correction)} = ${outboundTime} sec`
    };
  }
}

// ============================================
// FUEL ENDURANCE
// ============================================

function generateFuelEndurance(): Problem {
  const questionType = pick(['fuel-required', 'endurance', 'enough-fuel', 'ifr-reserve'] as const);

  if (questionType === 'fuel-required') {
    // VFR day: flight time + 30 min reserve
    const flightHours = pick([1, 2, 3, 4]);
    const flightMins = pick([0, 15, 20, 30, 40, 45]);
    const fuelFlows = [8, 10, 12, 14, 15, 18, 20];
    const fuelFlow = pick(fuelFlows);
    const isNight = Math.random() > 0.7;

    const flightTime = flightHours + flightMins / 60;
    const reserve = isNight ? 0.75 : 0.5; // 45 min night, 30 min day
    const totalTime = flightTime + reserve;
    const fuelRequired = totalTime * fuelFlow;

    const flightTimeStr = `${flightHours}:${flightMins.toString().padStart(2, '0')}`;

    return {
      id: generateId(),
      category: 'fuel-endurance',
      question: `VFR ${isNight ? 'night' : 'day'} flight of ${flightTimeStr}, fuel burn ${fuelFlow} gph. How many gallons needed?`,
      correctAnswer: Math.round(fuelRequired * 10) / 10,
      tolerance: 1,
      unit: 'gallons',
      hint: `VFR ${isNight ? 'night' : 'day'} reserve: ${isNight ? '45' : '30'} minutes`,
      explanation: `Flight: ${flightTime.toFixed(2)} hrs + ${isNight ? '0.75' : '0.5'} hr reserve = ${totalTime.toFixed(2)} hrs × ${fuelFlow} gph = ${fuelRequired.toFixed(1)} gal`
    };
  } else if (questionType === 'endurance') {
    // How long can you fly with X gallons at Y gph?
    const fuelOnBoard = pick([30, 40, 50, 60, 75, 80, 100, 120]);
    const fuelFlows = [8, 10, 12, 14, 15, 18];
    const fuelFlow = pick(fuelFlows);

    const endurance = fuelOnBoard / fuelFlow;
    const hours = Math.floor(endurance);
    const mins = Math.round((endurance - hours) * 60);

    return {
      id: generateId(),
      category: 'fuel-endurance',
      question: `You have ${fuelOnBoard} gallons on board, burning ${fuelFlow} gph. What is your endurance?`,
      correctAnswer: Math.round(endurance * 100) / 100,
      tolerance: 0.1,
      unit: 'hours',
      hint: 'Endurance = Fuel on board ÷ Fuel flow',
      explanation: `${fuelOnBoard} gal ÷ ${fuelFlow} gph = ${endurance.toFixed(2)} hrs (${hours}:${mins.toString().padStart(2, '0')})`
    };
  } else if (questionType === 'enough-fuel') {
    // Do you have enough fuel? Return how much extra/short
    const fuelOnBoard = pick([35, 40, 45, 50, 55, 60]);
    const flightHours = pick([2, 3, 4]);
    const flightMins = pick([0, 15, 30, 45]);
    const fuelFlow = pick([10, 12, 14]);

    const flightTime = flightHours + flightMins / 60;
    const reserve = 0.5; // VFR day
    const totalTime = flightTime + reserve;
    const fuelRequired = totalTime * fuelFlow;
    const difference = fuelOnBoard - fuelRequired;

    const flightTimeStr = `${flightHours}:${flightMins.toString().padStart(2, '0')}`;

    return {
      id: generateId(),
      category: 'fuel-endurance',
      question: `VFR day, ${fuelOnBoard} gal on board, ${flightTimeStr} flight, ${fuelFlow} gph burn. Extra fuel after reserve?`,
      correctAnswer: Math.round(difference * 10) / 10,
      tolerance: 1,
      unit: 'gallons',
      hint: 'Calculate fuel required (flight + 30 min reserve), then subtract from fuel on board',
      explanation: `Need: (${flightTime.toFixed(2)} + 0.5) × ${fuelFlow} = ${fuelRequired.toFixed(1)} gal. Have ${fuelOnBoard}. Extra: ${difference.toFixed(1)} gal`
    };
  } else {
    // IFR: flight time + alternate + 45 min reserve
    const flightHours = pick([2, 3, 4, 5]);
    const flightMins = pick([0, 10, 20, 30]);
    const altMins = pick([15, 20, 25, 30, 35, 40]);
    const fuelFlowPPH = pick([600, 700, 800, 900, 1000, 1200]);

    const flightTime = flightHours + flightMins / 60;
    const altTime = altMins / 60;
    const reserve = 0.75; // 45 minutes
    const totalTime = flightTime + altTime + reserve;
    const fuelRequired = totalTime * fuelFlowPPH;

    const flightTimeStr = `${flightHours}:${flightMins.toString().padStart(2, '0')}`;
    const altTimeStr = `0:${altMins.toString().padStart(2, '0')}`;

    return {
      id: generateId(),
      category: 'fuel-endurance',
      question: `IFR flight ${flightTimeStr}, alternate ${altTimeStr}, fuel flow ${fuelFlowPPH} pph. Pounds of fuel needed?`,
      correctAnswer: Math.round(fuelRequired),
      tolerance: 50,
      unit: 'lbs',
      hint: 'IFR = Flight + Alternate + 45 min reserve',
      explanation: `(${flightTime.toFixed(2)} + ${altTime.toFixed(2)} + 0.75) × ${fuelFlowPPH} = ${Math.round(fuelRequired)} lbs`
    };
  }
}

// ============================================
// SLANT RANGE DME
// ============================================

function generateSlantRange(): Problem {
  const questionType = pick(['over-station', 'slant-vs-ground', 'min-altitude'] as const);

  if (questionType === 'over-station') {
    // Directly over VOR at altitude, what does DME read?
    const altitudes = [6000, 9000, 12000, 15000, 18000, 21000, 24000, 30000, 36000];
    const altitude = pick(altitudes);
    const dme = altitude / 6000;

    return {
      id: generateId(),
      category: 'slant-range',
      question: `Directly over a VOR at ${altitude.toLocaleString()} ft. What does the DME read?`,
      correctAnswer: Math.round(dme * 10) / 10,
      tolerance: 0.2,
      unit: 'DME',
      hint: 'DME over station = Altitude ÷ 6,000 (6,000 ft ≈ 1 NM)',
      explanation: `${altitude.toLocaleString()} ft ÷ 6,000 = ${dme.toFixed(1)} NM`
    };
  } else if (questionType === 'slant-vs-ground') {
    // At close range and high altitude, slant range differs from ground distance
    // Using Pythagorean: Slant² = Ground² + (Alt/6000)²
    const groundDistances = [3, 4, 5, 6, 8];
    const ground = pick(groundDistances);
    const altitudes = [12000, 18000, 24000, 30000];
    const altitude = pick(altitudes);

    const altNM = altitude / 6000;
    const slant = Math.sqrt(ground * ground + altNM * altNM);

    return {
      id: generateId(),
      category: 'slant-range',
      question: `At ${altitude.toLocaleString()} ft, ${ground} NM ground distance from VOR. What does DME show?`,
      correctAnswer: Math.round(slant * 10) / 10,
      tolerance: 0.3,
      unit: 'DME',
      hint: 'Slant² = Ground² + (Altitude÷6000)². Close + high = bigger difference.',
      explanation: `Alt in NM = ${altNM.toFixed(1)}. Slant = √(${ground}² + ${altNM.toFixed(1)}²) = √${(ground*ground + altNM*altNM).toFixed(1)} = ${slant.toFixed(1)} NM`
    };
  } else {
    // What minimum altitude to show at least X DME when over station?
    const targetDMEs = [2, 3, 4, 5, 6];
    const targetDME = pick(targetDMEs);
    const minAltitude = targetDME * 6000;

    return {
      id: generateId(),
      category: 'slant-range',
      question: `What is the minimum altitude to show at least ${targetDME} DME when directly over the station?`,
      correctAnswer: minAltitude,
      tolerance: 100,
      unit: 'ft',
      hint: 'Altitude = DME × 6,000',
      explanation: `${targetDME} NM × 6,000 ft/NM = ${minAltitude.toLocaleString()} ft`
    };
  }
}

function generateCompassMath(): Problem {
  const heading = randInt(1, 36) * 10; // Use clean 10° increments
  const questionType = pick(['right-90', 'left-90', 'plus-30', 'minus-30', 'plus-45', 'minus-45', 'plus-210', 'minus-210']);

  const normalize = (h: number): number => {
    h = h % 360;
    return h <= 0 ? h + 360 : h;
  };

  switch (questionType) {
    case 'right-90': {
      const answer = normalize(heading + 90);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. What heading after a RIGHT 90° turn?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Right 90°: Add 100, subtract 10',
        explanation: `${heading} + 100 = ${heading + 100}, then - 10 = ${answer}°`
      };
    }
    case 'left-90': {
      const answer = normalize(heading - 90);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. What heading after a LEFT 90° turn?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Left 90°: Subtract 100, add 10',
        explanation: `${heading} - 100 = ${heading - 100}, then + 10 = ${answer}°`
      };
    }
    case 'plus-30': {
      const answer = normalize(heading + 30);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. Add 30°. What is the new heading?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Add 30° and wrap at 360° if needed. Used for teardrop hold entries.',
        explanation: `${heading} + 30 = ${heading + 30 > 360 ? `${heading + 30} - 360 = ` : ''}${answer}°`
      };
    }
    case 'minus-30': {
      const answer = normalize(heading - 30);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. Subtract 30°. What is the new heading?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Subtract 30° and wrap at 360° if needed. Used for teardrop hold entries.',
        explanation: `${heading} - 30 = ${heading - 30 <= 0 ? `${heading - 30} + 360 = ` : ''}${answer}°`
      };
    }
    case 'plus-45': {
      const answer = normalize(heading + 45);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. Add 45°. What is the new heading?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Add 45° and wrap at 360° if needed. Common for intercept angles.',
        explanation: `${heading} + 45 = ${heading + 45 > 360 ? `${heading + 45} - 360 = ` : ''}${answer}°`
      };
    }
    case 'minus-45': {
      const answer = normalize(heading - 45);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. Subtract 45°. What is the new heading?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Subtract 45° and wrap at 360° if needed. Common for intercept angles.',
        explanation: `${heading} - 45 = ${heading - 45 <= 0 ? `${heading - 45} + 360 = ` : ''}${answer}°`
      };
    }
    case 'plus-210': {
      const answer = normalize(heading + 210);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. Add 210°. What is the new heading?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Add 210°: same as subtracting 150° (360 - 210 = 150). Used for parallel hold entries.',
        explanation: `${heading} + 210 = ${heading + 210 > 360 ? `${heading + 210} - 360 = ` : ''}${answer}°`
      };
    }
    case 'minus-210': {
      const answer = normalize(heading - 210);
      return {
        id: generateId(),
        category: 'compass-math',
        question: `Heading ${heading.toString().padStart(3, '0')}°. Subtract 210°. What is the new heading?`,
        correctAnswer: answer,
        tolerance: 0,
        unit: '°',
        hint: 'Subtract 210°: same as adding 150° (360 - 210 = 150). Used for parallel hold entries.',
        explanation: `${heading} - 210 = ${heading - 210 <= 0 ? `${heading - 210} + 360 = ` : ''}${answer}°`
      };
    }
    default:
      return generateCompassMath();
  }
}

// ============================================
// MAIN GENERATOR
// ============================================

const generators: Record<ProblemCategory, () => Problem> = {
  'hours-to-decimal': generateHoursToDecimal,
  'reciprocal-heading': generateReciprocalHeading,
  'hydroplaning': generateHydroplaning,
  'temp-conversion': generateTempConversion,
  'isa-deviation': generateISADeviation,
  'pressure-altitude': generatePressureAltitude,
  'crosswind': generateCrosswind,
  'headwind-tailwind': generateHeadwindTailwind,
  'drift-angle': generateDriftAngle,
  'unit-conversion': generateUnitConversion,
  'visibility-rvr': generateVisibilityRVR,
  'fuel-weight': generateFuelWeight,
  'fuel-dumping': generateFuelDumping,
  'magnetic-compass': generateMagneticCompass,
  'sixty-to-one': generateSixtyToOne,
  'standard-rate-turn': generateStandardRateTurn,
  'turn-radius': generateTurnRadius,
  'true-airspeed': generateTrueAirspeed,
  'time-speed-distance': generateTimeSpeedDistance,
  'descent-planning': generateDescentPlanning,
  'visual-descent-point': generateVisualDescentPoint,
  'glide-distance': generateGlideDistance,
  'cloud-base': generateCloudBase,
  'holding-pattern': generateHoldingPattern,
  'fuel-endurance': generateFuelEndurance,
  'slant-range': generateSlantRange,
  'compass-math': generateCompassMath,
};

export function generateProblem(category?: ProblemCategory): Problem {
  const cat = category || pick(Object.keys(generators) as ProblemCategory[]);
  return generators[cat]();
}

export function generateProblems(count: number, category?: ProblemCategory): Problem[] {
  return Array.from({ length: count }, () => generateProblem(category));
}

export function getAllCategories(): ProblemCategory[] {
  return Object.keys(generators) as ProblemCategory[];
}

export function checkAnswer(problem: Problem, userAnswer: number): boolean {
  const diff = Math.abs(problem.correctAnswer - userAnswer);
  const tolerance = problem.tolerance;

  // For zero tolerance, must be exact
  if (tolerance === 0) {
    return userAnswer === problem.correctAnswer;
  }

  // For percentage-based tolerance
  if (tolerance < 1) {
    return diff <= Math.abs(problem.correctAnswer * tolerance);
  }

  // For absolute tolerance
  return diff <= tolerance;
}
