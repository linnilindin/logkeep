import {
  CreateMediaItemInput,
  MediaItem,
  MediaItemUpdate,
  MediaType,
  ReadingStatus,
  SearchResult,
} from '@/types';
import { getAccessToken, getSupabaseAuth } from './supabase-auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Read on every call rather than cached, so a token refreshed in the background
// is picked up without the caller knowing about it.
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
      ...init?.headers,
    },
  });

  // The API rejected the session, so drop it locally too. AuthProvider picks up
  // the change and the gate sends the user back to the login page.
  if (response.status === 401) {
    await getSupabaseAuth().auth.signOut();
    throw new Error('Your session expired. Please sign in again.');
  }

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
