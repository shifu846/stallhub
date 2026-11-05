import type { Booking, Stall, Tone } from '@/types';

export type StallView = {
  label: string;
  tone: Tone;
  canBook: boolean;
  decidable: Booking | null;
  vendorName: string | null;
  note: string | null;
};

// Pure function: given a stall and the bookings this user is allowed to see, decide what the row shows.
// RLS means a vendor only ever receives their own bookings, and an organiser receives all of theirs.
export function describeStall(stall: Stall, bookings: Booking[], userId: string, isOwner: boolean): StallView {
  const forStall = bookings.filter((b) => b.stall_id === stall.id);
  const active = forStall.find((b) => b.status !== 'rejected') ?? null;
  const mine = forStall.find((b) => b.vendor_id === userId) ?? null;
  const none = { decidable: null, vendorName: null, note: null };

  if (isOwner) {
    if (!active) return { label: 'Available', tone: 'success', canBook: false, ...none };
    const pending = active.status === 'pending';
    return {
      label: pending ? 'Request pending' : 'Booked',
      tone: pending ? 'warning' : 'info',
      canBook: false,
      decidable: pending ? active : null,
      vendorName: active.vendor?.display_name || 'A vendor',
      note: active.note || null,
    };
  }
  if (mine && mine.status !== 'rejected') {
    const pending = mine.status === 'pending';
    return {
      label: pending ? 'Your request: pending' : 'Your stall: approved',
      tone: pending ? 'warning' : 'success',
      canBook: false,
      ...none,
    };
  }
  if (stall.is_reserved) return { label: 'Taken', tone: 'neutral', canBook: false, ...none };
  if (mine?.status === 'rejected') return { label: 'Request rejected', tone: 'danger', canBook: true, ...none };
  return { label: 'Available', tone: 'success', canBook: true, ...none };
}