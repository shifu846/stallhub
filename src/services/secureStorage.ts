import * as SecureStore from 'expo-secure-store';

// A Supabase session is bigger than SecureStore's per-value limit, so it is stored in chunks.
// The session (access + refresh token) therefore stays in encrypted storage, never in AsyncStorage.
const CHUNK_SIZE = 1800;
const countKey = (key: string) => `${key}.count`;
const partKey = (key: string, index: number) => `${key}.part${index}`;

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = Number(await SecureStore.getItemAsync(countKey(key)));
    if (!count) return null;
    const parts: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const part = await SecureStore.getItemAsync(partKey(key, i));
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    await secureStorage.removeItem(key);
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i += 1) {
      await SecureStore.setItemAsync(partKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(countKey(key), String(count));
  },

  async removeItem(key: string): Promise<void> {
    const count = Number(await SecureStore.getItemAsync(countKey(key)));
    for (let i = 0; i < count; i += 1) await SecureStore.deleteItemAsync(partKey(key, i));
    await SecureStore.deleteItemAsync(countKey(key));
  },
};