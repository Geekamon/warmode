# Supabase Setup Guide

## Step 1: Run the Schema

Go to **Supabase Dashboard > SQL Editor** and run the entire contents of `schema.sql`.

This creates:
- `profiles` table (extends auth.users)
- `sessions` table (focus sessions)
- `favorites` table (partner bookmarks)
- `payments` table (Paystack transactions)
- `streak_logs` table (daily tracking)
- Row Level Security policies
- `handle_new_user()` trigger — auto-creates profile on signup
- `match_session()` RPC function — handles session matching
- `update_streak_on_complete()` trigger — updates streaks/stats when session completes

## Step 2: Verify Functions Exist

Run this in SQL Editor to verify:

```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

You should see:
- `handle_new_user`
- `match_session`
- `update_streak_on_complete`

## Step 3: Verify Triggers Exist

```sql
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

You should see:
- `on_session_completed` on `sessions` table

Also check auth triggers:
```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;
```

You should see `on_auth_user_created`.

## Step 4: Configure Supabase Auth

In **Supabase Dashboard > Authentication > URL Configuration**:
- Site URL: `https://warmode-drab.vercel.app`
- Redirect URLs: Add `https://warmode-drab.vercel.app/reset-password`

## Step 5: Environment Variables

Set these in your `.env.local` and in **Vercel Dashboard > Settings > Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
RESEND_API_KEY=your-resend-key
CRON_SECRET=your-cron-secret
NEXT_PUBLIC_APP_URL=https://warmode-drab.vercel.app
```

## Step 6: Supabase Webhooks (Optional)

For automated email notifications, set up webhooks in **Supabase Dashboard > Database > Webhooks**:

1. **New User Welcome Email**
   - Table: `profiles` (public schema)
   - Events: INSERT
   - URL: `https://warmode-drab.vercel.app/api/webhooks/supabase`

2. **Session Status Updates**
   - Table: `sessions` (public schema)
   - Events: UPDATE
   - URL: `https://warmode-drab.vercel.app/api/webhooks/supabase`

Both webhooks need the header: `x-webhook-secret: your-webhook-secret`
