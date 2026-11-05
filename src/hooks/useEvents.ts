import { getEventDetail, listEvents, listMyEvents } from '@/services/events';
import { getStall } from '@/services/stalls';
import { useResource } from './useResource';

export function useEvents() {
  return useResource('events:list', listEvents);
}

export function useMyEvents(userId: string) {
  return useResource(`events:mine:${userId}`, () => listMyEvents(userId));
}

export function useEventDetail(id: string) {
  return useResource(`event:${id}`, () => getEventDetail(id));
}

export function useStall(id: string) {
  return useResource(`stall:${id}`, () => getStall(id));
}