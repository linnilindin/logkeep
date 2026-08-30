export type ReadingStatus = 'reading' | 'to-read' | 'finished' | 'on-hold' | 'dropped';

export type MediaType = 'manga' | 'manhwa' | 'novel' | 'book' | 'other';

// The media_items CHECK constraint only permits these three, so requests are
// validated against this list rather than the wider ReadingStatus union.
export const PERSISTED_STATUSES = ['reading', 'to-read', 'finished'] as const;

export const MEDIA_TYPES = ['manga', 'manhwa', 'novel', 'book', 'other'] as const;

export interface MediaItem {
  id: number;
  title: string;
  author?: string;
  type: MediaType;
  tags: string[];
  current_value: number;
  is_ongoing: boolean;
  status: ReadingStatus;
  cover_image_url?: string | null;
  completed_chapters?: number | null;
  is_favourite: boolean;
  date_started?: string | null;
  date_completed?: string | null;
  last_updated_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMediaItemInput {
  title: string;
  author?: string;
  type: MediaType;
  tags: string[];
  current_value?: number;
  is_ongoing: boolean;
  status: ReadingStatus;
  cover_image_url?: string | null;
  completed_chapters?: number | null;
  is_favourite?: boolean;
  date_started?: string | null;
  date_completed?: string | null;
  last_updated_at?: string | null;
}

export interface MediaItemUpdate {
  title?: string;
  author?: string;
  type?: MediaType;
  tags?: string[];
  current_value?: number;
  is_ongoing?: boolean;
  status?: ReadingStatus;
  cover_image_url?: string | null;
  completed_chapters?: number | null;
  is_favourite?: boolean;
  date_started?: string | null;
  date_completed?: string | null;
  last_updated_at?: string | null;
}

export interface SearchResult {
  title: string;
  author?: string;
  coverImageUrl?: string;
  type: 'book' | 'manga';
}
