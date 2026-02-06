CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for follows" ON public.follows;
CREATE POLICY "Public read access for follows"
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own follows" ON public.follows;
CREATE POLICY "Users can insert own follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;
CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
