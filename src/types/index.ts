import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export type EventRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  venue: string;
  town: string;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  poster_url: string | null;
  created_at: string;
};

export type Stall = {
  id: string;
  event_id: string;
  name: string;
  category: string;
  price: number;
  is_reserved: boolean;
};

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export type Booking = {
  id: string;
  stall_id: string;
  vendor_id: string;
  status: BookingStatus;
  note: string;
  created_at: string;
  vendor?: { display_name: string } | null;
};

export type EventSummary = EventRow & { stalls: Pick<Stall, 'id' | 'is_reserved'>[] };
export type EventDetail = EventRow & { stalls: Stall[]; bookings: Booking[] };

export type StallWithEvent = Stall & {
  event: Pick<EventRow, 'id' | 'title' | 'starts_at' | 'venue' | 'owner_id'>;
};

export type MyBooking = Booking & {
  stall: { id: string; name: string; price: number; event: Pick<EventRow, 'id' | 'title' | 'starts_at' | 'venue'> };
};

export type EventInput = {
  title: string;
  description: string;
  venue: string;
  town: string;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  poster_url: string | null;
};

export type StallInput = { name: string; category: string; price: number };