import { getSupabase } from '../db/supabase';
import { badRequest, notFound } from '../lib/httpError';
import type {
  CreateMediaItemInput,
  MediaItem,
  MediaItemUpdate,
  ReadingStatus,
} from '../types';

const TABLE = 'media_items';

export async function listMediaItems(
  userId: string,
  status?: ReadingStatus
): Promise<MediaItem[]> {
  let query = getSupabase()
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MediaItem[];
}

export async function createMediaItem(
  userId: string,
  input: CreateMediaItemInput
): Promise<MediaItem> {
  const currentValue = input.current_value ?? 0;
  const completedChapters = input.is_ongoing ? null : input.completed_chapters ?? null;

  assertWithinTotal(currentValue, completedChapters);

  const finished = hasReachedTotal(currentValue, completedChapters);
  const timestamp = nowIso();

  const row: Record<string, unknown> = {
    user_id: userId,
    title: input.title,
    author: input.author || null,
    type: input.type,
    tags: input.tags,
    current_value: currentValue,
    is_ongoing: input.is_ongoing,
    status: finished ? 'finished' : input.status,
    cover_image_url: input.cover_image_url || null,
    completed_chapters: completedChapters,
    is_favourite: input.is_favourite ?? false,
    date_started: input.date_started ?? null,
    date_completed: input.date_completed ?? (finished ? timestamp : null),
    last_updated_at: input.last_updated_at ?? null,
  };

  const { data, error } = await getSupabase().from(TABLE).insert(row).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MediaItem;
}

export async function updateMediaItem(
  userId: string,
  id: number,
  updates: MediaItemUpdate
): Promise<MediaItem> {
  const existing = await findById(userId, id);
  const patch: Record<string, unknown> = { ...updates, updated_at: nowIso() };

  // Only re-derive progress when the request actually touches it, so an edit
  // like a favourite toggle is never blocked by unrelated stale data.
  const touchesProgress =
    updates.current_value !== undefined ||
    updates.completed_chapters !== undefined ||
    updates.is_ongoing !== undefined;

  if (touchesProgress) {
    const isOngoing = updates.is_ongoing ?? existing.is_ongoing;
    const currentValue = updates.current_value ?? existing.current_value;
    const completedChapters = isOngoing
      ? null
      : updates.completed_chapters !== undefined
        ? updates.completed_chapters
        : existing.completed_chapters ?? null;

    assertWithinTotal(currentValue, completedChapters);

    // An ongoing series has no total, so clear a stale value rather than
    // letting the two fields contradict each other.
    patch.completed_chapters = completedChapters;

    if (hasReachedTotal(currentValue, completedChapters)) {
      patch.status = 'finished';
      if (!existing.date_completed && updates.date_completed === undefined) {
        patch.date_completed = nowIso();
      }
    }
  }

  return writeUpdate(userId, id, patch);
}

export async function updateMediaProgress(
  userId: string,
  id: number,
  currentValue: number
): Promise<MediaItem> {
  const existing = await findById(userId, id);

  if (currentValue < existing.current_value) {
    throw badRequest(
      `Progress cannot move backwards. Current chapter is ${existing.current_value}.`
    );
  }

  const completedChapters = existing.is_ongoing
    ? null
    : existing.completed_chapters ?? null;

  assertWithinTotal(currentValue, completedChapters);

  const timestamp = nowIso();
  const patch: Record<string, unknown> = {
    current_value: currentValue,
    updated_at: timestamp,
    last_updated_at: timestamp,
  };

  if (hasReachedTotal(currentValue, completedChapters)) {
    patch.status = 'finished';
    if (!existing.date_completed) {
      patch.date_completed = timestamp;
    }
  } else if (existing.status === 'to-read') {
    patch.status = 'reading';
  }

  return writeUpdate(userId, id, patch);
}

export async function deleteMediaItem(userId: string, id: number): Promise<void> {
  await findById(userId, id);

  const { error } = await getSupabase()
    .from(TABLE)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function findById(userId: string, id: number): Promise<MediaItem> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw notFound(`Media item ${id} not found`);
  }

  return data as MediaItem;
}

async function writeUpdate(
  userId: string,
  id: number,
  patch: Record<string, unknown>
): Promise<MediaItem> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MediaItem;
}

function assertWithinTotal(currentValue: number, completedChapters: number | null): void {
  if (completedChapters !== null && currentValue > completedChapters) {
    throw badRequest(
      `Current chapter (${currentValue}) cannot exceed the total of ${completedChapters}.`
    );
  }
}

function hasReachedTotal(currentValue: number, completedChapters: number | null): boolean {
  return completedChapters !== null && completedChapters > 0 && currentValue >= completedChapters;
}

function nowIso(): string {
  return new Date().toISOString();
}
