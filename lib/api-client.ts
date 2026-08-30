import {
  CreateMediaItemInput,
  MediaItem,
  MediaItemUpdate,
  MediaType,
  ReadingStatus,
  SearchResult,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Phase 2 reads the Supabase session token here. The API already looks for an
// Authorization header, so only this function needs to change.
function getAuthHeaders(): Record<string, string> {
  return {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();

    if (body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Response had no JSON body, fall through to the generic message.
  }

  return `Request failed with status ${response.status}`;
}

export async function getMediaItems(status?: ReadingStatus): Promise<MediaItem[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';

  return request<MediaItem[]>(`/api/media${query}`);
}

export async function createMediaItem(input: CreateMediaItemInput): Promise<MediaItem> {
  return request<MediaItem>('/api/media', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateMediaItem(
  id: number,
  updates: MediaItemUpdate
): Promise<MediaItem> {
  return request<MediaItem>(`/api/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Progress has its own endpoint because the server enforces that a chapter
// count only moves forward, which a full edit is allowed to break.
export async function quickUpdateMediaItem(
  id: number,
  currentValue: number
): Promise<MediaItem> {
  return request<MediaItem>(`/api/media/${id}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ current_value: currentValue }),
  });
}

export async function deleteMediaItem(id: number): Promise<void> {
  await request<{ success: boolean }>(`/api/media/${id}`, { method: 'DELETE' });
}

export async function searchMedia(
  query: string,
  mediaType: MediaType
): Promise<SearchResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({ q: trimmed, type: mediaType });

  return request<SearchResult[]>(`/api/search?${params.toString()}`);
}
