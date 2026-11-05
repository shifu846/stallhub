// Open-Meteo: a free weather API with no key. The request is driven by REAL coordinates:
// the event's saved latitude/longitude (chosen from a town or the device GPS).
const BASE = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 10000;

export type DayForecast = { date: string; code: number; max: number; min: number; rainChance: number };

export async function getForecast(latitude: number, longitude: number): Promise<DayForecast[]> {
  const params = [
    `latitude=${latitude.toFixed(4)}`,
    `longitude=${longitude.toFixed(4)}`,
    'daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    'timezone=auto',
    'forecast_days=16',
  ].join('&');

  // Without a timeout a dead connection could leave the spinner running forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}?${params}`, { signal: controller.signal });
    // fetch only rejects on NETWORK failure: a 429 or 500 still resolves, so check res.ok ourselves.
    if (res.status === 429) throw new Error('Too many weather requests (rate limit)');
    if (!res.ok) throw new Error(`Weather service error ${res.status}`);
    const json = await res.json();
    const daily = json?.daily;
    if (!daily || !Array.isArray(daily.time)) return [];
    return daily.time.map((date: string, i: number) => ({
      date,
      code: Number(daily.weather_code?.[i] ?? 0),
      max: Math.round(Number(daily.temperature_2m_max?.[i] ?? 0)),
      min: Math.round(Number(daily.temperature_2m_min?.[i] ?? 0)),
      rainChance: Math.round(Number(daily.precipitation_probability_max?.[i] ?? 0)),
    }));
  } finally {
    clearTimeout(timer);
  }
}