# Spark

A 75-day habit-building app. Find your spark — seventy-five days of the habits you choose, held honest by the people who show up with you.

Built with Next.js 14, deployed on Vercel. Installable on iOS via "Add to Home Screen."

---

## Local dev

```bash
cd spark
npm install
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel — step by step

Same flow as Pantry Pal. Three phases: GitHub → Vercel → iPhone.

### Phase 1 · Push to GitHub

Open Terminal and `cd` into the `spark` folder.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

If you have the GitHub CLI (`gh`) installed:

```bash
gh repo create spark --private --source=. --push
```

Otherwise via github.com:

1. Go to https://github.com/new
2. Repo name: `spark` (or whatever you like)
3. **Don't** add a README, .gitignore, or license — we already have those
4. Click **Create repository**
5. Copy the URL it shows you (looks like `https://github.com/YOUR_USERNAME/spark.git`)
6. Back in Terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/spark.git
git push -u origin main
```

### Phase 2 · Connect to Vercel

1. Go to https://vercel.com/new
2. If prompted, give Vercel access to your `spark` GitHub repo
3. Click **Import** next to the repo
4. Leave all settings as default — Next.js is auto-detected
5. Click **Deploy**
6. Wait ~30 seconds. You'll get a URL like `spark-abc123.vercel.app`

Every `git push` to `main` will auto-deploy from now on.

### Phase 3 · Install on your iPhone

1. Open the Vercel URL in **Safari** on your iPhone (Chrome won't install PWAs to home screen the same way)
2. Tap the **Share** button (square with up-arrow)
3. Scroll down → tap **Add to Home Screen**
4. Tap **Add**

Spark now lives on your home screen with the 75-lightning icon. Opens full-screen like a native app.

---

## Project structure

```
spark/
├── app/
│   ├── layout.tsx       Root layout, fonts, manifest links
│   ├── page.tsx         Mounts the App component
│   └── globals.css      All styles (ported from HTML prototype)
├── components/          React components (PhoneFrame, OnboardingFlow, tabs, sheets)
├── lib/
│   ├── types.ts         TypeScript types for state
│   ├── data.ts          CATEGORIES, PRESETS, MOCK_PHOTOS, quotes
│   ├── store.ts         Zustand global store
│   └── helpers.ts       small utility functions
├── public/
│   ├── icon.svg         Home-screen icon (75 + lightning bolt)
│   └── manifest.webmanifest
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
```

---

## Iterating

After the first deploy, the flow is:

1. Edit code in `spark/`
2. `git add . && git commit -m "your message" && git push`
3. Vercel auto-deploys in ~30 seconds
4. Refresh the page on your phone (or reinstall to home screen if icon/manifest changed)

---

## Tech notes

- **State**: Zustand store (`lib/store.ts`). All app state in one place, accessible from any component via `useSpark()`.
- **Styling**: Custom CSS variables in `app/globals.css` (matches the prototype 1:1). No Tailwind — keeps the journal-aesthetic typography intact.
- **Fonts**: Fraunces (serif headlines) + Inter (body), loaded from Google Fonts in the layout.
- **PWA**: `public/manifest.webmanifest` enables Add-to-Home-Screen. Icon is the SVG at `public/icon.svg`.
- **No server**: All data is in-memory client state. For a future real product, persist to a backend (Supabase, Firestore, your own API).
