-- Phase 2: scope every media item to a Supabase Auth user.
--
-- Run this in the Supabase SQL editor before starting the app with auth enabled.
-- Existing rows keep user_id NULL until you claim them in step 2 below, and the
-- API filters on user_id, so they stay hidden until then.

-- Step 1: schema
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON media_items(user_id);

-- The API talks to Postgres with the service role key, which bypasses RLS and
-- scopes rows in code instead. This policy is the second line of defence: it
-- stops anything holding only the anon key from reading another user's rows.
DROP POLICY IF EXISTS "Allow public access" ON media_items;

CREATE POLICY "Users see own items" ON media_items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 2: after signing up at /login, claim the rows that predate auth.
-- Find the id with: SELECT id, email FROM auth.users;
--
-- UPDATE media_items SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- ALTER TABLE media_items ALTER COLUMN user_id SET NOT NULL;
