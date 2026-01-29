-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read posts (public feed)
DROP POLICY IF EXISTS "Public read access for posts" ON public.posts;
CREATE POLICY "Public read access for posts"
  ON public.posts FOR SELECT
  USING (true);

-- Enable RLS on post_images table
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read post_images (public feed)
DROP POLICY IF EXISTS "Public read access for post_images" ON public.post_images;
CREATE POLICY "Public read access for post_images"
  ON public.post_images FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own posts
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert images for their posts
DROP POLICY IF EXISTS "Users can insert post images" ON public.post_images;
CREATE POLICY "Users can insert post images"
  ON public.post_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Allow authenticated users to delete images from their posts
DROP POLICY IF EXISTS "Users can delete own post images" ON public.post_images;
CREATE POLICY "Users can delete own post images"
  ON public.post_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_images.post_id
      AND posts.user_id = auth.uid()
    )
  );
