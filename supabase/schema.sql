-- WarMode Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'Lagos',
  role TEXT CHECK (role IN ('remote', 'student', 'entrepreneur', 'creative')) DEFAULT 'remote',
  plan TEXT CHECK (plan IN ('free', 'soldier', 'student_plan', 'squad')) DEFAULT 'free',
  avatar_url TEXT,
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SESSIONS
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  duration INTEGER CHECK (duration IN (25, 50, 75)) NOT NULL,
  mode TEXT CHECK (mode IN ('video', 'audio')) DEFAULT 'video',
  match_type TEXT CHECK (match_type IN ('anyone', 'city', 'role', 'favorite')) DEFAULT 'anyone',
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('open', 'matched', 'active', 'completed', 'cancelled')) DEFAULT 'open',
  host_goal TEXT,
  partner_goal TEXT,
  host_rating INTEGER CHECK (host_rating BETWEEN 1 AND 4),
  partner_rating INTEGER CHECK (partner_rating BETWEEN 1 AND 4),
  daily_room_url TEXT, -- Daily.co video room URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FAVORITES (partner bookmarks)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favorite_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorite_id)
);

-- 4. PAYMENTS (Paystack transactions)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in kobo (₦1 = 100 kobo)
  currency TEXT DEFAULT 'NGN',
  plan TEXT CHECK (plan IN ('soldier', 'student_plan', 'squad')),
  paystack_reference TEXT UNIQUE,
  paystack_status TEXT,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STREAKS (daily tracking)
CREATE TABLE streak_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  sessions_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);

-- ═══ INDEXES ═══
CREATE INDEX idx_sessions_host ON sessions(host_id);
CREATE INDEX idx_sessions_partner ON sessions(partner_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled ON sessions(scheduled_at);
CREATE INDEX idx_sessions_open ON sessions(status, scheduled_at) WHERE status = 'open';
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_streak_logs_user ON streak_logs(user_id, session_date);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ═══ ROW LEVEL SECURITY ═══
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions: users can see their own sessions
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = partner_id);
CREATE POLICY "Users can create sessions" ON sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Users can update own sessions" ON sessions FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = partner_id);

-- Open sessions are visible to all (for matching)
CREATE POLICY "Open sessions are visible" ON sessions FOR SELECT
  USING (status = 'open');

-- Favorites
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Streak logs
CREATE POLICY "Users can view own streaks" ON streak_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can log own streaks" ON streak_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══ FUNCTIONS ═══

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Warrior')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Match a user to an open session
CREATE OR REPLACE FUNCTION match_session(
  p_user_id UUID,
  p_duration INTEGER,
  p_mode TEXT,
  p_match_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_user_city TEXT;
  v_user_role TEXT;
BEGIN
  -- Get user info for matching
  SELECT city, role INTO v_user_city, v_user_role FROM profiles WHERE id = p_user_id;

  -- Find an open session matching criteria
  SELECT id INTO v_session_id FROM sessions
  WHERE status = 'open'
    AND host_id != p_user_id
    AND duration = p_duration
    AND mode = p_mode
    AND scheduled_at <= NOW() + INTERVAL '5 minutes'
    AND (
      p_match_type = 'anyone'
      OR (p_match_type = 'city' AND host_id IN (SELECT id FROM profiles WHERE city = v_user_city))
      OR (p_match_type = 'role' AND host_id IN (SELECT id FROM profiles WHERE role = v_user_role))
      OR (p_match_type = 'favorite' AND host_id IN (SELECT favorite_id FROM favorites WHERE user_id = p_user_id))
    )
  ORDER BY scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_session_id IS NOT NULL THEN
    -- Match found - update session
    UPDATE sessions SET partner_id = p_user_id, status = 'matched' WHERE id = v_session_id;
    RETURN v_session_id;
  ELSE
    -- No match - create new open session
    INSERT INTO sessions (host_id, duration, mode, match_type, scheduled_at, status)
    VALUES (p_user_id, p_duration, p_mode, p_match_type, NOW(), 'open')
    RETURNING id INTO v_session_id;
    RETURN v_session_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update streak after session completion
CREATE OR REPLACE FUNCTION update_streak_on_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_had_yesterday BOOLEAN;
  v_current_streak INTEGER;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update for both host and partner
    FOREACH v_user_id IN ARRAY ARRAY[NEW.host_id, NEW.partner_id] LOOP
      IF v_user_id IS NOT NULL THEN
        -- Log today's session
        INSERT INTO streak_logs (user_id, session_date, sessions_count)
        VALUES (v_user_id, v_today, 1)
        ON CONFLICT (user_id, session_date)
        DO UPDATE SET sessions_count = streak_logs.sessions_count + 1;

        -- Check if they had a session yesterday
        SELECT EXISTS(SELECT 1 FROM streak_logs WHERE user_id = v_user_id AND session_date = v_yesterday)
        INTO v_had_yesterday;

        -- Update streak
        IF v_had_yesterday THEN
          UPDATE profiles SET
            streak_current = streak_current + 1,
            streak_best = GREATEST(streak_best, streak_current + 1),
            total_sessions = total_sessions + 1,
            total_hours = total_hours + (NEW.duration::NUMERIC / 60),
            last_session_date = v_today,
            updated_at = NOW()
          WHERE id = v_user_id AND last_session_date != v_today;
        ELSE
          UPDATE profiles SET
            streak_current = 1,
            streak_best = GREATEST(streak_best, 1),
            total_sessions = total_sessions + 1,
            total_hours = total_hours + (NEW.duration::NUMERIC / 60),
            last_session_date = v_today,
            updated_at = NOW()
          WHERE id = v_user_id;
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_session_completed
  AFTER UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_complete();
