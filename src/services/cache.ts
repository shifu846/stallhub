import AsyncStorage from '@react-native-async-storage/async-storage';

// Offline cache (Brief 3.3): the last successful response of each list, saved as JSON.
const PREFIX = 'cache:';

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // The cache is best effort: failing to save must never break the screen.
  }
}

// Called on sign-out so the next user never sees the previous user's saved data.
export async function clearCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX) || k.startsWith('draft:')));
  } catch {
    // Nothing useful to do if storage is unavailable.
  }
}