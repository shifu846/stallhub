import type { IconName } from '@/types';

// Open-Meteo returns WMO weather codes. This maps them to words and an icon.
export function describeWeather(code: number): { label: string; icon: IconName } {
  if (code === 0) return { label: 'Clear sky', icon: 'sunny-outline' };
  if (code <= 3) return { label: 'Partly cloudy', icon: 'partly-sunny-outline' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: 'cloud-outline' };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: 'rainy-outline' };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: 'rainy-outline' };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: 'snow-outline' };
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: 'rainy-outline' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'thunderstorm-outline' };
  return { label: 'Cloudy', icon: 'cloud-outline' };
}