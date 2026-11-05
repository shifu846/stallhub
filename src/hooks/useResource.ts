import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { readCache, writeCache } from '@/services/cache';
import { describeError } from '@/services/errors';

// The tri-state pattern (Lecture 7): one `status` makes impossible states (loading AND error) unrepresentable.
export type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ok'; data: T; fromCache: boolean };

// Offline-first read:
//   1. show the cached copy at once  2. fetch fresh data  3. on failure keep the cache and flag "offline"
export function useResource<T>(cacheKey: string, fetcher: () => Promise<T>) {
  const [state, setState] = useState<ResourceState<T>>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher; // always call the latest fetcher
  }, [fetcher]);

  const load = useCallback(async () => {
    try {
      const data = await fetcherRef.current();
      setState({ status: 'ok', data, fromCache: false });
      void writeCache(cacheKey, data);
    } catch (error) {
      const cached = await readCache<T>(cacheKey);
      setState(
        cached !== null
          ? { status: 'ok', data: cached, fromCache: true }
          : { status: 'error', message: describeError(error) }
      );
    }
  }, [cacheKey]);

  useEffect(() => {
    let active = true;
    (async () => {
      const cached = await readCache<T>(cacheKey);
      if (active && cached !== null) setState({ status: 'ok', data: cached, fromCache: true });
      await load();
    })();
    return () => {
      active = false;
    };
  }, [cacheKey, load]);

  const retry = useCallback(async () => {
    setState({ status: 'loading' });
    await load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { state, refreshing, reload: load, retry, refresh };
}

// Tabs keep screens mounted, so useEffect runs once. This re-fetches every time the screen regains focus
// (for example after a modal saved something), but skips the first focus because the hook already loaded.
export function useRefreshOnFocus(reload: () => Promise<void>) {
  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (first.current) {
        first.current = false;
        return;
      }
      void reload();
    }, [reload])
  );
}