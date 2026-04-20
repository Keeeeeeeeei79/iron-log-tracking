# IRON LOG 🏋️

A minimal, dark-themed workout tracker. Log exercises and sets, visualize your progress with calendar heatmaps, bar charts, and cumulative rankings.

![Dark theme with lime green accent](https://img.shields.io/badge/theme-dark-0a0a0a) ![React](https://img.shields.io/badge/react-18-61dafb) ![Vite](https://img.shields.io/badge/vite-5-646cff)

## Features

- **Calendar view** — see which days you trained at a glance
- **Graph view** — 30-day bar chart of daily sets
- **Totals view** — all-time ranking of exercises by total sets
- **Stats** — total sets, training days, exercise count, current streak
- **Offline-first** — data saved in localStorage, works without internet
- **Mobile-friendly** — responsive design, no pinch-zoom

## Tech Stack

- React 18 + Vite
- Recharts (bar charts)
- Lucide React (icons)
- Tailwind CSS
- localStorage for persistence

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" → select this repo
4. Click "Deploy" (zero config needed)
5. Done — you'll get a URL like `iron-log.vercel.app`

## License

MIT
