-- Phase 2 migration. Do not run until Phase 2 (Supabase Auth) begins.
--
-- Running this while the app has no login will hide every existing row, because
-- the new policy requires auth.uid() to match user_id and the current rows have
-- user_id set to NULL.

ALTER TABLE media_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_media_items_user_id ON media_items(user_id);

-- After creating your account, claim the existing rows and lock the column down:
-- UPDATE media_items SET user_id = '<your-user-uuid>' WHERE user_id IS NULL;
-- ALTER TABLE media_items ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Allow public access" ON media_items;

CREATE POLICY "Users see own items" ON media_items
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
