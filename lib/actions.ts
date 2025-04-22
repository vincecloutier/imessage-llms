'use server'

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour - adjust as needed

type SaveEntityPayload = {
  /** present when editing */
  id?: string;
  /** key/value attributes */
  attributes: Record<string, any>;
  /** optional sender address */
  sender_address?: string | null;
};

//
// Save a Profile: creates or updates based on presence of id.
//
export async function saveProfile(payload: SaveEntityPayload) {
    'use server';
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr) throw new Error(authErr.message);
    if (!user) throw new Error('User not found');

    const { data, error } = await supabase
        .from('profiles')
        .insert({
        id: user.id,
        attributes: payload.attributes,
        sender_address: payload.sender_address ?? user.email,
        })
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

//
// Save a Persona: creates or updates based on presence of id.
//
export async function savePersona(payload: SaveEntityPayload) {
  'use server';
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);
  if (!user) throw new Error('User not found');

  if (payload.id) {
    const { data, error } = await supabase
      .from('personas')
      .update({
        attributes: payload.attributes,
        sender_address: payload.sender_address,
      })
      .eq('id', payload.id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase
      .from('personas')
      .insert({
        user_id: user.id,
        attributes: payload.attributes,
        sender_address: payload.sender_address,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}

//
// Delete a Persona: deletes based on id and user_id.
//
export async function deletePersona(id: string) {
  'use server';
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw new Error(authErr.message);
  if (!user) throw new Error('User not found');

  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) throw new Error(error.message);
  return { success: true };
}


export const createSignedAttachmentUrl = cache(async (filePath: string) => {
  if (!filePath) {
    return { error: 'File path is required.', signedUrl: null };
  }

  const supabase = await createClient();

  // Add RLS requirement: Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      return { error: 'Authentication required.', signedUrl: null };
  }

  if (!filePath.startsWith(`${user.id}/`)) { return { error: 'Unauthorized' }; }

  try {
    // 1. Check cache first (RLS will automatically filter by user_id)
    const { data: cachedData, error: cacheError } = await supabase
      .from('cached_signed_urls')
      .select('signed_url, expires_at')
      .eq('file_path', filePath)
      .eq('user_id', user.id) 
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') { // Ignore 'PGRST116' (Row not found)
      console.error('Error checking cache:', cacheError);
    }

    if (cachedData?.signed_url && new Date(cachedData.expires_at) > new Date()) {
      console.log(`Using cached signed URL for path: [${filePath}] for user [${user.id}]`);
      return { error: null, signedUrl: cachedData.signed_url };
    }

    // 2. If not in cache or expired, generate new URL
    console.log(`Generating new signed URL for path: [${filePath}] for user [${user.id}]`);
    const { data: storageData, error: storageError } = await supabase.storage
      .from('attachments')
      .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

    if (storageError) {
      console.error('Error creating signed URL:', storageError);
      return { error: storageError.message, signedUrl: null };
    }

    if (!storageData?.signedUrl) {
      return { error: 'Failed to generate signed URL.', signedUrl: null };
    }

    // 3. Store the new URL in the cache (RLS requires user_id)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + SIGNED_URL_EXPIRY_SECONDS);

    const { error: upsertError } = await supabase
      .from('cached_signed_urls')
      .upsert({
        file_path: filePath,
        signed_url: storageData.signedUrl,
        expires_at: expiresAt.toISOString(),
        user_id: user.id // Add user_id for RLS
      });

    if (upsertError) {
      console.error('Error saving signed URL to cache:', upsertError);
    } else {
        console.log(`Cached new signed URL for path: [${filePath}] for user [${user.id}]`);
    }

    return { error: null, signedUrl: storageData.signedUrl };

  } catch (e: any) {
    console.error(`Unexpected error generating signed URL for user [${user.id}]:`, e);
    return { error: e.message || 'An unexpected error occurred.', signedUrl: null };
  }
}); 