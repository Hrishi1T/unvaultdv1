-- Allow public read access to users for displaying author info
DROP POLICY IF EXISTS "Public read access for users" ON public.users;
CREATE POLICY "Public read access for users"
  ON public.users FOR SELECT
  USING (true);

-- Allow public read access to likes for displaying like counts
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for likes" ON public.likes;
CREATE POLICY "Public read access for likes"
  ON public.likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own likes" ON public.likes;
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public read access to saves for displaying save counts
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for saves" ON public.saves;
CREATE POLICY "Public read access for saves"
  ON public.saves FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own saves" ON public.saves;
CREATE POLICY "Users can insert own saves"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saves" ON public.saves;
CREATE POLICY "Users can delete own saves"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);
