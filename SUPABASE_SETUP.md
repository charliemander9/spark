# Supabase setup — step by step

Spark uses Supabase as its backend (database + user accounts). Free tier is plenty for what we're doing.

Three things you do in your browser, one command in Terminal. ~10 minutes.

---

## 1 · Create a Supabase project

1. Go to **https://supabase.com** and click **Start your project**
2. Sign in with GitHub (easiest — same account you used for Vercel)
3. Click **New Project**
   - **Project name:** `spark`
   - **Database password:** click "Generate a password" and **save it somewhere** (you probably won't need it, but back it up)
   - **Region:** pick the one closest to you (East US if you're on the East Coast)
   - Click **Create new project**
4. Wait ~60 seconds while Supabase provisions the database

---

## 2 · Run the schema

Supabase has a built-in SQL editor.

1. In the left sidebar, click **SQL Editor** (icon looks like `</>`)
2. Click **New query**
3. In your Spark project on your Mac, open `db/schema.sql` and **copy the entire file**
4. Paste it into the Supabase SQL editor
5. Click **Run** (bottom right)

You should see "Success. No rows returned." That created all the tables, security rules, and the auto-profile trigger.

To verify: in the sidebar click **Table Editor**. You should see `profiles`, `daily_entries`, `friendships`, `nudges` listed.

---

## 3 · Grab your API keys

1. In the left sidebar, click the gear icon **Settings → API**
2. You'll see a **Project URL** (looks like `https://abc123.supabase.co`) — copy it
3. Under **Project API keys**, copy the one labelled **`anon` `public`** (a long string starting with `eyJ...`)

Keep that tab open — you'll paste these into Vercel next.

---

## 4 · Add the keys to Vercel

1. Go to **https://vercel.com/dashboard** → click your `spark` project
2. Click **Settings** → **Environment Variables**
3. Add the first variable:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** paste the Project URL from Supabase
   - **Environments:** check **Production**, **Preview**, **Development**
   - Click **Save**
4. Add the second:
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** paste the anon public key
   - **Environments:** check all three
   - Click **Save**

---

## 5 · Push the latest code & redeploy

Back in Terminal in your spark folder:

```
./push.sh "wire up supabase"
```

Vercel auto-redeploys with the new env vars baked in. ~30 seconds.

---

## You're done

Once that deploys, Spark is connected to Supabase. Right now the app still uses local mock data — but the foundation is in place. The next push (5b) will replace the hardcoded `Charlie` user with a real sign-in screen + invite-a-friend flow.

### Local dev (optional)

If you want to run Spark on your laptop to test before pushing:

1. In the spark folder, copy `.env.local.example` to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and paste your Supabase URL and anon key
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

### Verifying the connection

To prove Supabase is wired up, after the next push you'll see a "Sign in" screen replace the Welcome wordmark on first launch. If env vars are missing or wrong, you'll see "Backend not configured — running in local mode" at the bottom.
