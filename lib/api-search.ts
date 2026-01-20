/**
 * Open Library API
 * Jikan API (MyAnimeList)
 */

export interface SearchResult {
  title: string;
  author?: string;
  coverImageUrl?: string;
  type: 'book' | 'manga';
}


export async function searchBooks(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    // limit to 5 results
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // parse response
    const data = await response.json();

    // map to logkeeps format
    const results: SearchResult[] = (data.docs || []).map((book: any) => {
      // openlibrary returns cover images as IDs, will need to construct URL
      const coverId = book.cover_i;
      const coverImageUrl = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : undefined;

      return {
        title: book.title || 'Unknown Title',
        author: book.author_name?.[0] || undefined,
        coverImageUrl,
        type: 'book' as const,
      };
    });

    return results;
  } catch (error) {
    console.error('Error searching books:', error);
    return [];
  }
}

export async function searchManga(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // map to logkeep format
    const results: SearchResult[] = (data.data || []).map((manga: any) => ({
      title: manga.title || manga.title_english || 'Unknown Title',
      author: manga.authors?.[0]?.name || undefined,
      coverImageUrl: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url,
      type: 'manga' as const,
    }));

    return results;
  } catch (error) {
    console.error('Error searching manga:', error);
    return [];
  }
}

// pick right api based on media type
export async function searchMedia(
  query: string,
  mediaType: 'book' | 'manga' | 'manhwa' | 'novel' | 'other'
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  if (mediaType === 'manga' || mediaType === 'manhwa') {
    return searchManga(query);
  } else if (mediaType === 'book' || mediaType === 'novel') {
    return searchBooks(query);
  } else {
    // For 'other', try both APIs and combine results
    const [bookResults, mangaResults] = await Promise.all([
      searchBooks(query),
      searchManga(query),
    ]);
    return [...bookResults, ...mangaResults];
  }
}

