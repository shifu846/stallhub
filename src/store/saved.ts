import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Saved (hearted) events: living client state shared by every card, persisted across restarts.
type SavedState = {
  ids: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

export const useSaved = create<SavedState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((i) => i !== id) : [...s.ids, id] })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'saved-events', storage: createJSONStorage(() => AsyncStorage), version: 1 }
  )
);