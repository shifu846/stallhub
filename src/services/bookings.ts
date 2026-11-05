import type { Booking, BookingStatus, MyBooking } from '@/types';
import { supabase } from './supabase';

const BOOKING_FIELDS = 'id, stall_id, vendor_id, status, note, created_at';

// Row Level Security decides what comes back: a vendor receives their own rows,
// an organiser receives every request for their events. The app does not filter for security.
export async function listBookingsForStalls(stallIds: string[]): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`${BOOKING_FIELDS}, vendor:profiles(display_name)`)
    .in('stall_id', stallIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Booking[];
}

export async function listMyBookings(userId: string): Promise<MyBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`${BOOKING_FIELDS}, stall:stalls(id, name, price, event:events(id, title, starts_at, venue))`)
    .eq('vendor_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as MyBooking[];
}

export async function createBooking(stallId: string, note: string): Promise<void> {
  const { error } = await supabase.from('bookings').insert({ stall_id: stallId, note: note.trim() });
  if (error) throw error;
}

export async function cancelBooking(id: string): Promise<void> {
  const { data, error } = await supabase.from('bookings').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('row-level security: nothing was deleted');
}

export async function decideBooking(id: string, status: Exclude<BookingStatus, 'pending'>): Promise<void> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
  if (error) throw error;
}