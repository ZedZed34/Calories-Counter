-- Calories Counter — Database Schema
-- Run this in the Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ── Profiles (extends auth.users) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  sex TEXT CHECK (sex IN ('male', 'female')),
  age INT CHECK (age >= 10 AND age <= 100),
  height_cm NUMERIC(5,1) CHECK (height_cm >= 100 AND height_cm <= 230),
  weight_kg NUMERIC(5,1) CHECK (weight_kg >= 30 AND weight_kg <= 250),
  activity_key TEXT,
  target_weight_kg NUMERIC(5,1) CHECK (target_weight_kg >= 40 AND target_weight_kg <= 200),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Weight tracking ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weight_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, logged_date)
);

-- Index for fetching a user's weight history in date order
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date
  ON weight_logs(user_id, logged_date DESC);

-- ── Daily food log entries ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS food_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  servings NUMERIC(5,2) NOT NULL DEFAULT 1,
  calories NUMERIC(7,1) NOT NULL,
  protein_g NUMERIC(6,1) DEFAULT 0,
  fat_g NUMERIC(6,1) DEFAULT 0,
  carbs_g NUMERIC(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_entries_user_date
  ON food_entries(user_id, logged_date DESC);

-- ── User's custom/saved foods ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_foods (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size_g NUMERIC(7,1),
  calories_per_100g NUMERIC(7,1) NOT NULL,
  protein_per_100g NUMERIC(6,1) DEFAULT 0,
  fat_per_100g NUMERIC(6,1) DEFAULT 0,
  carbs_per_100g NUMERIC(6,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Row-Level Security ─────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

-- Each user can only access their own rows

DROP POLICY IF EXISTS "Users own profiles" ON profiles;
CREATE POLICY "Users own profiles" ON profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users own weight logs" ON weight_logs;
CREATE POLICY "Users own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own food entries" ON food_entries;
CREATE POLICY "Users own food entries" ON food_entries
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own custom foods" ON custom_foods;
CREATE POLICY "Users own custom foods" ON custom_foods
  FOR ALL USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
