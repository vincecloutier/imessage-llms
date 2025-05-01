'use server'

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SaveEntityPayload } from '@/lib/types';

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour - adjust as needed

async function getSupabaseUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!user) throw new Error('User not found');
  return { supabase, user };
}

export async function saveProfile(payload: SaveEntityPayload) {
    'use server';
    const { supabase, user } = await getSupabaseUser();
    const profile = {id: user.id, attributes: payload.attributes, sender_address: payload.sender_address};
    const { data, error } = await supabase.from('profiles').upsert(profile).select().single();
    if (error) throw new Error(error.message);
    return data;
}

export async function savePersona(payload: SaveEntityPayload) {
  'use server';
  const { supabase, user } = await getSupabaseUser();
  const query = !!payload.id
    ? supabase.from('personas').update({ attributes: payload.attributes, sender_address: payload.sender_address }).eq('id', payload.id).eq('user_id', user.id)
    : supabase.from('personas').insert({ user_id: user.id, attributes: payload.attributes, sender_address: payload.sender_address });
  const { data, error } = await query.select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePersona(id: string) {
  'use server';
  const { supabase, user } = await getSupabaseUser();
  const { error } = await supabase.from('personas').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(error.message);
  return { success: true };
}

export const createSignedAttachmentUrl = cache(async (filePath: string) => {
  if (!filePath) return { error: 'File path is required.', signedUrl: null };

  const { supabase, user } = await getSupabaseUser();

  if (!filePath.startsWith(`${user.id}/`)) return { error: 'Unauthorized', signedUrl: null };

  // first check cache
  const { data: cachedData, error: cacheError } = await supabase.from('cached_signed_urls').select('signed_url, expires_at').eq('file_path', filePath).eq('user_id', user.id).single();

  // ignore "row not found" error, but log others
  if (cacheError && cacheError.code !== 'PGRST116') {
    console.error('Error checking cache:', cacheError);
  }

  // if cached url is still valid, return it
  if (cachedData?.signed_url && new Date(cachedData.expires_at) > new Date()) {
    return { error: null, signedUrl: cachedData.signed_url };
  }

  // next generate new signed url
  const { data: storageData, error: storageError } = await supabase.storage.from('attachments').createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS);

  // if error or no signed url, return error
  if (storageError || !storageData?.signedUrl) {
    return { error: storageError?.message || 'Failed to generate signed URL.', signedUrl: null };
  }

  // cache the new url (don't fail if this errors)
  const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000);
  const { error: upsertError } = await supabase.from('cached_signed_urls').upsert({
      file_path: filePath,
      signed_url: storageData.signedUrl,
      expires_at: expiresAt.toISOString(),
      user_id: user.id
    });
  if (upsertError) console.error('Error saving signed URL to cache:', upsertError);

  // return the signed url
  return { error: null, signedUrl: storageData.signedUrl };
}); 


export async function searchCity(query: string) {
  if (!query || query.length < 3) {
    return { error: 'Query must be at least 3 characters' };
  }
  try {
    const response = await fetch(`https://serpapi.com/locations.json?q=${encodeURIComponent(query)}&limit=1`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();
    const tzlookup = require("@photostructure/tz-lookup");
    const firstCity = data[0];
    return {
      name: firstCity.canonical_name.replace(/,/g, ', '),
      lat: firstCity.gps[1],
      lon: firstCity.gps[0],
      timezone: tzlookup(firstCity.gps[1], firstCity.gps[0])
    };
  } catch (error) {
    console.error('Error fetching city:', error);
    return { error: 'Failed to fetch city. Please try again with a different query.' };
  }
}