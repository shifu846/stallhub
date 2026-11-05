import { getForecast } from '@/services/weather';
import { useResource } from './useResource';

// The cache key includes rounded coordinates, so each location keeps its own saved forecast for offline use.
export function useWeather(latitude: number, longitude: number) {
  return useResource(`weather:${latitude.toFixed(2)}:${longitude.toFixed(2)}`, () =>
    getForecast(latitude, longitude)
  );
}