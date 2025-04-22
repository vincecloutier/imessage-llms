'use server'

import { createClient } from '@/lib/supabase/server'

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