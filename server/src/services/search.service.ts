import type { MediaType, SearchResult } from '../types';

const MAX_RESULTS = 5;
const REQUEST_TIMEOUT_MS = 8000;

export async function searchMedia(
  query: string,
  mediaType: MediaType
): Promise<SearchResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  if (mediaType === 'manga' || mediaType === 'manhwa') {
    return normalize(await searchManga(trimmed));
  }

  if (mediaType === 'book' || mediaType === 'novel') {
    return normalize(await searchBooks(trimmed));
  }

  const [books, manga] = await Promise.all([searchBooks(trimmed), searchManga(trimmed)]);

  return normalize(interleave(books, manga));
}

async function searchBooks(query: string): Promise<SearchResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${MAX_RESULTS}`;
  const data = await fetchJson<{ docs?: OpenLibraryDoc[] }>(url, 'Open Library');

  if (!data) {
    return [];
  }

  return (data.docs ?? []).map((doc) => ({
    title: doc.title ?? '',
    author: doc.author_name?.[0],
    // Open Library returns a cover id, so the image URL has to be built.
    coverImageUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : undefined,
    type: 'book' as const,
  }));
}

async function searchManga(query: string): Promise<SearchResult[]> {
  const url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=${MAX_RESULTS}`;
  const data = await fetchJson<{ data?: JikanManga[] }>(url, 'Jikan');

  if (!data) {
    return [];
  }

  return (data.data ?? []).map((manga) => ({
    title: manga.title || manga.title_english || '',
    author: manga.authors?.[0]?.name,
    coverImageUrl: manga.images?.jpg?.large_image_url ?? manga.images?.jpg?.image_url,
    type: 'manga' as const,
  }));
}

async function fetchJson<T>(url: string, source: string): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

    if (!response.ok) {
      console.error(`${source} search failed with status ${response.status}`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`${source} search error:`, error);
    return null;
  }
}

// Drop unusable entries, collapse duplicate titles, and cap the list so the
// dropdown stays a consistent size regardless of which sources answered.
function normalize(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const output: SearchResult[] = [];

  for (const result of results) {
    const title = result.title.trim();

    if (!title) {
      continue;
    }

    const key = title.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push({ ...result, title });

    if (output.length === MAX_RESULTS) {
      break;
    }
  }

  return output;
}

// Alternate sources so a combined search does not get filled by whichever API
// happened to return more rows.
function interleave(first: SearchResult[], second: SearchResult[]): SearchResult[] {
  const merged: SearchResult[] = [];
  const length = Math.max(first.length, second.length);

  for (let index = 0; index < length; index += 1) {
    if (first[index]) {
      merged.push(first[index]);
    }
    if (second[index]) {
      merged.push(second[index]);
    }
  }

  return merged;
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  cover_i?: number;
}

interface JikanManga {
  title?: string;
  title_english?: string;
  authors?: { name?: string }[];
  images?: { jpg?: { image_url?: string; large_image_url?: string } };
}
