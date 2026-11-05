import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Chip } from '@/components/Chip';
import { EventCard } from '@/components/EventCard';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { useEvents } from '@/hooks/useEvents';
import { useRefreshOnFocus } from '@/hooks/useResource';
import { useSaved } from '@/store/saved';
import { useTheme } from '@/theme/ThemeProvider';

// EVENTS LIST (Read): search + "saved" filter + pull-to-refresh + offline cache + all four states.
export default function EventsScreen() {
  const { theme } = useTheme();
  const { state, refreshing, refresh, reload, retry } = useEvents();
  const savedIds = useSaved((s) => s.ids);
  const [query, setQuery] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);

  useRefreshOnFocus(reload);

  const search = query.trim().toLowerCase();

  let body;
  if (state.status === 'loading') {
    body = <LoadingView label="Loading events..." />;
  } else if (state.status === 'error') {
    body = <ErrorState message={state.message} onRetry={retry} />;
  } else {
    const all = state.data;
    const shown = all.filter(
      (e) =>
        (!onlySaved || savedIds.includes(e.id)) &&
        (!search || `${e.title} ${e.town} ${e.venue}`.toLowerCase().includes(search))
    );
    body = (
      <FlatList
        data={shown}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          state.fromCache ? (
            <Banner icon="cloud-offline-outline" tone="warning" message="You are offline. Showing saved events." />
          ) : null
        }
        ListEmptyComponent={
          all.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="No events yet"
              message="Be the first to organise one. Add an event and its stalls from the Organise tab."
              actionLabel="Organise an event"
              onAction={() => router.push('/event-form')}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No matches"
              message={onlySaved ? 'You have not saved any matching events.' : 'Try a different search.'}
            />
          )
        }
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: theme.spacing.m, paddingBottom: 0, gap: theme.spacing.s }}>
        <TextField
          label="Search events"
          value={query}
          onChangeText={setQuery}
          placeholder="Title, town or venue"
          returnKeyType="search"
          autoCorrect={false}
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.s }}>
          <Chip label="All events" selected={!onlySaved} onPress={() => setOnlySaved(false)} />
          <Chip label="Saved" selected={onlySaved} onPress={() => setOnlySaved(true)} />
        </View>
      </View>
      {body}
    </View>
  );
}