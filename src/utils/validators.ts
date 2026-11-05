export type EventFormValues = {
  title: string;
  description: string;
  venue: string;
  town: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
};

export type EventFieldErrors = Partial<Record<'title' | 'description' | 'venue' | 'town' | 'date' | 'time', string>>;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Builds a local Date from the two text fields, or null when either is malformed.
export function parseStart(date: string, time: string): Date | null {
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function validateEvent(values: EventFormValues, requireFuture: boolean): EventFieldErrors {
  const errors: EventFieldErrors = {};
  const title = values.title.trim();
  if (title.length < 3) errors.title = 'Give the event a title of at least 3 characters';
  else if (title.length > 80) errors.title = 'Keep the title under 80 characters';
  if (values.venue.trim().length < 3) errors.venue = 'Enter the venue, e.g. "Lae Main Market"';
  if (!values.town) errors.town = 'Choose the nearest town';
  if (values.description.length > 500) errors.description = 'Keep the description under 500 characters';

  const start = parseStart(values.date, values.time);
  if (!DATE_RE.test(values.date)) errors.date = 'Use the format YYYY-MM-DD, e.g. 2026-11-21';
  else if (TIME_RE.test(values.time) && start === null) errors.date = 'That date does not exist';
  if (!TIME_RE.test(values.time)) errors.time = 'Use 24-hour time, e.g. 08:30';
  if (start && requireFuture && start.getTime() < Date.now()) errors.date = 'Pick a date in the future';
  return errors;
}

export function validateStall(name: string, priceText: string): { name?: string; price?: string } {
  const errors: { name?: string; price?: string } = {};
  if (name.trim().length < 2) errors.name = 'Give the stall a name, e.g. "Stall A1"';
  const price = Number(priceText.replace(',', '.'));
  if (!priceText.trim() || !Number.isFinite(price) || price <= 0) errors.price = 'Enter a price in Kina, e.g. 50';
  else if (price > 100000) errors.price = 'That price looks too high';
  return errors;
}