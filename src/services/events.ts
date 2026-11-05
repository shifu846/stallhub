import type { EventDetail, EventInput, EventRow, EventSummary, Stall } from '@/types';
import { listBookingsForStalls } from './bookings';
import { supabase } from './supabase';

const SUMMARY = '*, stalls(id, is_reserved)';

export async function listEvents(): Promise<EventSummary[]> {
  const { data, error } = await supabase.from('events').select(SUMMARY).order('starts_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as EventSummary[];
}

export async function listMyEvents(userId: string): Promise<EventSummary[]> {
  const { data, error } = await supabase
    .from('events')
    .select(SUMMARY)
    .eq('owner_id', userId)
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as EventSummary[];
}

// One event, its stalls, and the bookings this user is allowed to see (RLS filters them server-side).
export async function getEventDetail(id: string): Promise<EventDetail> {
  const { data, error } = await supabase.from('events').select('*, stalls(*)').eq('id', id).single();
  if (error) throw error;
  const { stalls: rawStalls, ...event } = data as unknown as EventRow & { stalls: Stall[] };
  const stalls = [...(rawStalls ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const bookings = stalls.length > 0 ? await listBookingsForStalls(stalls.map((s) => s.id)) : [];
  return { ...event, stalls, bookings };
}

export async function createEvent(input: EventInput): Promise<EventRow> {
  const { data, error } = await supabase.from('events').insert(input).select().single();
  if (error) throw error;
  return data as EventRow;
}

export async function updateEvent(id: string, input: EventInput): Promise<EventRow> {
  // .select().single() makes a blocked update (RLS) fail loudly instead of silently changing 0 rows.
  const { data, error } = await supabase.from('events').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as EventRow;
}

export async function deleteEvent(id: string): Promise<void> {
  const { data, error } = await supabase.from('events').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('row-level security: nothing was deleted');
}