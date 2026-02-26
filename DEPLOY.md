# WarMode — Deployment Guide

## What You've Got

A fully built Next.js web app with 17 screens and real Supabase authentication:

**Public pages:** Landing page, Signup, Login, Onboarding
**Dashboard:** Home, Book Session, Matching, Live Session, Session Complete, My Sessions, Stats, Community, Profile

**Tech stack:** Next.js 15 + TypeScript + Tailwind CSS v4 + Supabase Auth + WebRTC (peer-to-peer video/audio)

---

## Step 1: Set Up Supabase (10 minutes)

This is the only account you need to go live.

1. Go to [supabase.com](https://supabase.com) → Sign up free
2. Click **New Project** → name it "warmode" → choose a region close to Nigeria (e.g., EU West)
3. Wait for the project to finish setting up (~2 minutes)
4. Go to **SQL Editor** (left sidebar) → click **New Query**
5. Open the file `supabase/schema.sql` from this project → copy ALL of it → paste into the editor → click **Run**
6. You should see "Success. No rows returned" — that means it worked
7. Go to **Settings → API** (left sidebar, under Project Settings)
8. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
9. Copy your **anon public key** (the long one starting with `eyJ...`)

---

## Step 2: Set Up Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub (free)
2. You'll connect your GitHub account during signup

---

## Step 3: Configure & Run Locally (5 minutes)

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Open `.env.local` and fill in your Supabase keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

That's it — just those 2 lines + the app URL. Video calls work out of the box using free peer-to-peer WebRTC.

3. Install and run:
```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) → you should see the WarMode landing page

5. Try signing up — it will create a real user in your Supabase project!

---

## Step 4: Deploy to the Internet (5 minutes)

1. Create a GitHub repo and push your code:
```bash
git init
git add .
git commit -m "WarMode MVP — activate war mode"
git remote add origin https://github.com/YOUR_USERNAME/warmode.git
git push -u origin main
```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Click **Import** next to your warmode repo
4. Before deploying, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase key
   - `NEXT_PUBLIC_APP_URL` → leave blank for now (Vercel sets it automatically)
5. Click **Deploy**
6. In ~60 seconds your app will be live at `warmode.vercel.app`

**IMPORTANT:** After deploying, go to Supabase → Authentication → URL Configuration → add your Vercel URL to "Redirect URLs" (e.g., `https://warmode.vercel.app/**`)

---

## Step 5: Custom Domain (Optional)

1. Buy a domain (e.g., `warmode.ng` or `warmode.co` or `getwarmode.com`)
2. In Vercel → your project → Settings → Domains → Add your domain
3. Update your DNS records as Vercel shows you
4. Update your Supabase redirect URLs to include the new domain

---

## Current Costs: ₦0/month

| Service | Free Tier | When You'd Pay |
|---------|-----------|----------------|
| Supabase | 50K users, 500MB storage, unlimited auth | 10,000+ active users |
| Vercel | 100GB bandwidth, unlimited deploys | Very high traffic |
| WebRTC | Unlimited — peer-to-peer, no server | Never (it's free forever) |
| STUN (Google) | Unlimited | Never |
| TURN (optional) | 50GB/month on Metered.ca | Only if users behind strict firewalls |

---

## What's Working Now
- Real user signup and login (Supabase Auth)
- User profiles auto-created on signup
- Protected dashboard (redirects to login if not signed up)
- All 17 screens with full WarMode dark theme
- Database with matching algorithm, streak tracking, row-level security
- Landing page with "Coming Soon" on paid tiers
- Real-time peer-to-peer video and audio calls (WebRTC)
- End-to-end encrypted sessions (DTLS + SRTP, built into WebRTC)
- Real-time session matching via Supabase Realtime
- Mute/camera toggle during live sessions

## Adding Paystack Later (When You're Ready)

When you want to start charging:

1. Sign up at [paystack.com](https://paystack.com)
2. Uncomment the Paystack lines in `.env.local`
3. Add your Paystack keys
4. I'll wire up the checkout flow — just ask

The pricing UI, plan tiers, and database tables are already built. You'll just need the payment popup connected.

## Adding a TURN Server (Only If Needed)

Most users (85%+) will connect fine with just the free Google STUN servers that are already built in. But if some users behind strict corporate firewalls or campus networks can't connect, you can add a free TURN server:

1. Go to [metered.ca/stun-turn](https://www.metered.ca/stun-turn) → Sign up (free — 50GB/month)
2. Get your TURN credentials from the dashboard
3. Uncomment the TURN lines in `.env.local` and add your credentials
4. Redeploy — that's it

## Full Roadmap

1. ~~Build the app~~ ✅
2. ~~Strip payments for launch~~ ✅
3. ~~Wire up real auth~~ ✅
4. ~~Add peer-to-peer video calls~~ ✅
5. ~~Real-time session matching~~ ✅
6. **You: Set up Supabase + deploy** ← you are here
7. Add Paystack payments
8. Push notifications
9. Mobile responsive / PWA
10. Launch marketing
