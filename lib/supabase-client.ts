import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MediaItem, CreateMediaItemInput, ReadingStatus } from '@/types';

let supabaseClient: SupabaseClient | null = null;

// helper
function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
}

// tiny wrapper
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

// Database functions
export async function getMediaItems(status?: ReadingStatus) {
  let query = supabase
    .from('media_items')
    .select('*')
    .order('updated_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data as MediaItem[];
}

export async function quickUpdateMediaItem(id: number, currentValue: number) {
  const { data, error } = await supabase
    .from('media_items')
    .update({ 
      current_value: currentValue,
      updated_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as MediaItem;
}

export async function updateMediaItem(
  id: number,
  updates: {
    title?: string;
    author?: string;
    type?: string;
    tags?: string[];
    current_value?: number;
    is_ongoing?: boolean;
    status?: ReadingStatus;
    cover_image_url?: string | null;
    completed_chapters?: number | null;
    is_favourite?: boolean | null;
    date_started?: string | null;
    date_completed?: string | null;
    last_updated_at?: string | null;
  }
) {
  const { data, error } = await supabase
    .from('media_items')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as MediaItem;
}

export async function createMediaItem(input: CreateMediaItemInput) {
  const { data, error } = await supabase
    .from('media_items')
    .insert({
      title: input.title,
      author: input.author || null,
      type: input.type,
      tags: input.tags,
      current_value: input.current_value ?? 0,
      is_ongoing: input.is_ongoing,
      status: input.status,
      cover_image_url: input.cover_image_url || null,
      completed_chapters: input.completed_chapters || null,
      is_favourite: input.is_favourite || false,
      date_started: input.date_started || null,
      date_completed: input.date_completed || null,
      last_updated_at: input.last_updated_at || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as MediaItem;
}

export async function deleteMediaItem(id: number) {
  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}