// Supabase Storage helpers — uploads files to public buckets and returns
// permanent URLs we can save in the DB.

import { supabase } from './supabase';

/**
 * Upload a single file to the `avatars` bucket under the user's id and return
 * the public URL. Replaces any existing avatar for the user.
 */
export async function uploadAvatar(
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  // Cache-bust so the new image shows immediately
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: `${data.publicUrl}?t=${Date.now()}` };
}

/**
 * Upload a daily-entry photo or video. Returns a permanent public URL.
 * `index` keeps file names unique when posting multiple in one day.
 */
export async function uploadEntryFile(
  file: File,
  dateStr: string,
  index: number,
): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: 'Backend not configured' };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const ext = (file.name.split('.').pop() || (file.type.startsWith('video/') ? 'mp4' : 'jpg')).toLowerCase();
  const path = `${user.id}/${dateStr}-${index}.${ext}`;

  const { error } = await supabase.storage
    .from('entries')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from('entries').getPublicUrl(path);
  return { url: data.publicUrl };
}
