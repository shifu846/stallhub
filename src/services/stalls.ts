import type { Stall, StallInput, StallWithEvent } from '@/types';
import { supabase } from './supabase';

export async function getStall(id: string): Promise<StallWithEvent> {
  const { data, error } = await supabase
    .from('stalls')
    .select('*, event:events(id, title, starts_at, venue, owner_id)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as StallWithEvent;
}

export async function createStall(eventId: string, input: StallInput): Promise<Stall> {
  const { data, error } = await supabase.from('stalls').insert({ ...input, event_id: eventId }).select().single();
  if (error) throw error;
  return data as Stall;
}

export async function updateStall(id: string, input: StallInput): Promise<Stall> {
  const { data, error } = await supabase.from('stalls').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Stall;
}

export async function deleteStall(id: string): Promise<void> {
  const { data, error } = await supabase.from('stalls').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('row-level security: nothing was deleted');
}