import { MediaType, ReadingStatus } from '@/types';

export const READING_MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'novel', label: 'Novel' },
  { value: 'book', label: 'Book' },
  { value: 'other', label: 'Other' },
];

export const WATCHING_MEDIA_TYPES: { value: string; label: string }[] = [
  { value: 'movie', label: 'Movie' },
  { value: 'series', label: 'Series' },
  { value: 'anime', label: 'Anime' },
];

export const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'to-read', label: 'To-Read' },
  { value: 'finished', label: 'Finished' },
];

export const COMMON_TAGS = [
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Comedy',
  'Drama',
  'Action',
  'Adventure',
  'Slice of Life',
  'Historical',
];

