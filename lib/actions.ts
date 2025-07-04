'use server'

import { cache } from 'react'

import { Profile, Persona } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

const SIGNED_URL_EXPIRY_SECONDS = 3600 // one hour

// supabase actions //
async function getSupabaseUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw new Error(error.message)
  if (!user) throw new Error('User not found')
  return { supabase, user }
}

export async function saveProfile(profile: Profile) {
  const { supabase } = await getSupabaseUser()
  const { data, error } = await supabase.from('profiles').upsert(profile).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function savePersona(persona: Persona) {
  const { supabase, user } = await getSupabaseUser()
  // if this persona is being set as a platform persona, unset any existing platform personas (except for the current persona)
  if (persona.is_imessage_persona) {
    await supabase.from('personas').update({ is_imessage_persona: false }).eq('user_id', user.id)
  }

  if (persona.is_telegram_persona) {
    await supabase.from('personas').update({ is_telegram_persona: false }).eq('user_id', user.id)
  }
  
  const { data, error } = await supabase.from('personas').upsert(persona).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deletePersona(id: string) {
  const { supabase, user } = await getSupabaseUser()
  const { error } = await supabase.from('personas').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

export const createSignedAttachmentUrl = cache(async (filePath: string) => {
  const { supabase, user } = await getSupabaseUser()
  if (!filePath || !filePath.startsWith(`${user.id}/`))
    return { error: 'Unauthorized', signedUrl: null }

  // if cached url is still valid, return it
  const { data: cachedData } = await supabase
    .from('cached_signed_urls')
    .select('signed_url, expires_at')
    .eq('file_path', filePath)
    .eq('user_id', user.id)
    .single()
  if (cachedData?.signed_url && new Date(cachedData.expires_at) > new Date()) {
    return { error: null, signedUrl: cachedData.signed_url }
  }

  // generate new signed url and return error if it fails
  const { data: storageData, error: storageError } = await supabase.storage
    .from('attachments')
    .createSignedUrl(filePath, SIGNED_URL_EXPIRY_SECONDS)
  if (storageError || !storageData?.signedUrl) {
    return { error: storageError?.message || 'Failed to generate signed URL.', signedUrl: null }
  }

  // cache the new url (don't fail if this errors, just log it)
  const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY_SECONDS * 1000)
  const { error: upsertError } = await supabase.from('cached_signed_urls').upsert({
    file_path: filePath,
    signed_url: storageData.signedUrl,
    expires_at: expiresAt.toISOString(),
    user_id: user.id,
  })
  if (upsertError) console.error('Error saving signed URL to cache:', upsertError)

  // return the signed url
  return { error: null, signedUrl: storageData.signedUrl }
})

// non supabase actions //
export async function searchLocation(query: string) {
  const response = await fetch(
    `https://serpapi.com/locations.json?q=${encodeURIComponent(query)}&limit=1`
  )
  if (!response.ok) {
    return { error: 'Failed to fetch city. Please try again with a different query.' }
  }
  const data = await response.json()
  const tzlookup = require('@photostructure/tz-lookup')
  const firstCity = data[0]
  if (!firstCity) {
    return { error: 'No matching location found' }
  }
  return {
    name: firstCity.canonical_name.replace(/,/g, ', '),
    lat: firstCity.gps[1],
    lon: firstCity.gps[0],
    timezone: tzlookup(firstCity.gps[1], firstCity.gps[0]),
  }
}
