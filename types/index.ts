export type ReadingStatus = 'reading' | 'to-read' | 'finished' | 'on-hold' | 'dropped';

export type MediaType = 'manga' | 'manhwa' | 'novel' | 'book' | 'other';

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


