-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup + invoke notify-signup edge function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Watchlist table
CREATE TABLE public.user_watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie','tv')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, media_type)
);

ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own watchlist" ON public.user_watchlist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watchlist" ON public.user_watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own watchlist" ON public.user_watchlist
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_watchlist_user ON public.user_watchlist(user_id, created_at DESC);

-- Continue watching
CREATE TABLE public.user_continue_watching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie','tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  season INTEGER,
  episode INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, media_type)
);

ALTER TABLE public.user_continue_watching ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own continue" ON public.user_continue_watching
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own continue" ON public.user_continue_watching
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own continue" ON public.user_continue_watching
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own continue" ON public.user_continue_watching
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_continue_user ON public.user_continue_watching(user_id, updated_at DESC);
