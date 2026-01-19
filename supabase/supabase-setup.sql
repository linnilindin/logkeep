DROP TABLE IF EXISTS media_items CASCADE;

CREATE TABLE media_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  type TEXT NOT NULL CHECK (type IN ('manga', 'manhwa', 'novel', 'book', 'other')),
  tags TEXT[] DEFAULT '{}',
  current_value INTEGER NOT NULL DEFAULT 0,
  total_value INTEGER,
  is_ongoing BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL CHECK (status IN ('reading', 'to-read', 'finished')),
  cover_image_url TEXT,
  completed_chapters INTEGER,
  is_favourite BOOLEAN NOT NULL DEFAULT false,
  date_started TIMESTAMPTZ,
  date_completed TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_items_status ON media_items(status);
CREATE INDEX IF NOT EXISTS idx_media_items_updated_at ON media_items(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_items_is_favourite ON media_items(is_favourite) WHERE is_favourite = true;
CREATE INDEX IF NOT EXISTS idx_media_items_date_started ON media_items(date_started);
CREATE INDEX IF NOT EXISTS idx_media_items_date_completed ON media_items(date_completed);
CREATE INDEX IF NOT EXISTS idx_media_items_status_updated_at ON media_items(status, updated_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access" ON media_items
  FOR ALL USING (true) WITH CHECK (true);
