import { listMyBookings } from '@/services/bookings';
import { useResource } from './useResource';

export function useMyBookings(userId: string) {
  return useResource(`bookings:${userId}`, () => listMyBookings(userId));
}