# Push 2 — Icon fix + full screen port

## What changed

### Icon (fixes "7 only" and low contrast)
- Both digits now render — uses DejaVu Serif Bold Italic baked into the PNG
- Cream halo stroke around the 75 so it pops against the yellow bolt
- Decorative blue circles removed
- New SVG fallback with the same composition

### PhoneFrame status bar
- The fake `9:41 / notch / signal` bar now auto-hides on actual phones (narrow viewport or PWA standalone mode)
- Desktop preview still shows the phone-frame chrome

### All onboarding screens ported to React
- Welcome, ChallengePicker, Privacy, Buddies, FindFriends — all real
- Five preset cards on Challenge picker (75 Hard Lite default + Endurance, Recomp, Recovery, Build my own)
- Buddies has working text input + add/remove
- Find Friends has follow toggles for the 4 suggested users

### App tabs working
- Home with daily-entry gate banner + course cards + streak pill + daily quote
- Profile (Apple-ring monthly calendar + diary grid + 3-stat grid)
- Discover, Capture, Friends are placeholder tabs (small stubs — content in next push)

### Sheets
- **Settings sheet** — Edit challenge / Buddies / Find more people nav rows; tone, privacy, strict streaks, name input, restart, test buttons
- **Daily Entry sheet** — Photo carousel (up to 5) or Journal textarea, unlocks the day
- **Workout sheet** — Type/duration/place inputs + photo+video carousel (up to 5, max 1 video) + Apple Watch / Fitbit / Strava import buttons
- **Numeric sheet** — Steps/Water/Sleep/Reading/Custom logging with manual entry + sync (where supported)

### Day 75 celebration
- Full-screen celebration with "75 Days. Done." headline, stats grid, "Begin Another 75" button

---

## How to apply this push to your local spark folder

1. **Open your `spark/` folder** in Finder
2. **Open the `spark-update/` folder** I just shared (click the link in chat)
3. **Drag the contents** of `spark-update/` (not the folder itself, but everything inside it) into your `spark/` folder. When macOS asks "Replace?" — click **Replace All**.

You'll be merging:
- `components/PhoneFrame.tsx` — replaces existing
- `components/App.tsx` — replaces existing
- `components/OnboardingFlow.tsx` — replaces existing
- `components/onboarding/` — replaces Welcome, adds 4 new files
- `components/tabs/` — 5 new files
- `components/sheets/` — 4 new files
- `components/Calendar.tsx`, `CourseCard.tsx`, `DailyGate.tsx`, `Day75.tsx`, `TabBar.tsx` — 5 new files
- `lib/store.ts` — replaces existing (added a few action methods)
- `lib/storeActions.ts` — 1 new file (UI state for sheet open/close)
- `public/icon.svg`, `icon-512.png`, `icon-192.png`, `apple-touch-icon.png` — all replaced

4. Open Terminal in your `spark/` folder:
   ```
   git add .
   git commit -m "Push 2: icon fix, status bar hide, full screen port"
   git push
   ```

5. Wait 30 seconds. Vercel auto-deploys.

6. Pull-to-refresh on your phone (or close & reopen the Spark icon). New icon + all the screens should be live.

---

## Tasks still on the list (next push)

- **Discover tab** — feed of success-story cards
- **Friends tab** — buddy avatars + nudges + photo posts
- **Capture tab** — workout-proof video/photo flow
- **Custom builder UI** in onboarding — currently a placeholder
- **Settings test buttons** — minor polish (correct restart flow)

Tell me what feels weird on your phone after this push and I'll fix in the next.
