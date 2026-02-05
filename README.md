# Pilot Mental Math Trainer

A web app for daily practice of mental math skills for pilots, based on "Mental Math for Pilots" by Ronald D. McElroy.

## Features

- **20 Problem Categories** covering all major pilot mental math skills
- **30-minute Timed Sessions** for focused daily practice
- **Progress Tracking** with accuracy and speed metrics
- **Formula Reference** page for quick review
- **Streak Tracking** to build consistent daily habits

## Problem Categories

- Hours to Decimal Conversion
- Reciprocal Headings
- Hydroplaning Speed
- Temperature Conversions (F/C)
- ISA Temperature & Deviation
- Pressure Altitude
- Crosswind Components
- Headwind/Tailwind Components
- Drift Angle
- Unit Conversions (NM/SM, Knots/MPH)
- Visibility to RVR
- Fuel Weight Calculations
- Fuel Dumping
- Magnetic Compass (UNOS/ANDS)
- 60-to-1 Rule
- Standard Rate Turn Bank Angle
- Turn Radius
- True Airspeed
- Time-Speed-Distance
- Descent Planning (3-to-1 Rule)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- localStorage for progress persistence

## Deploy to Vercel

### Quick Deploy

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Click Deploy

### Manual Steps

1. Create a new repository on GitHub:
   - Go to github.com/new
   - Name it `pilot-math-trainer`
   - Keep it public (or private)
   - Click "Create repository"

2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pilot-math-trainer.git
   git push -u origin main
   ```

3. Deploy to Vercel:
   - Go to vercel.com and sign in with GitHub
   - Click "Add New Project"
   - Import your `pilot-math-trainer` repository
   - Click "Deploy"

Your app will be live at `https://pilot-math-trainer.vercel.app` (or similar).

## License

Based on "Mental Math for Pilots" by Ronald D. McElroy (2004).

This application is for educational purposes.
