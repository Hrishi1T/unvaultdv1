-- Add username and username_changed_at fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMPTZ;

-- Create function to auto-generate username from user id on insert
CREATE OR REPLACE FUNCTION public.generate_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NULL THEN
    NEW.username := 'user_' || LEFT(NEW.id::text, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating username
DROP TRIGGER IF EXISTS generate_username_trigger ON public.users;
CREATE TRIGGER generate_username_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.generate_username();

-- Update existing users without usernames to have auto-generated ones
UPDATE public.users 
SET username = 'user_' || LEFT(id::text, 8)
WHERE username IS NULL;

-- Policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
