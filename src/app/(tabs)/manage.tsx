import { router } from 'expo-router';
import { FlatList, RefreshControl, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { EventCard } from '@/components/EventCard';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useMyEvents } from '@/hooks/useEvents';
import { useRefreshOnFocus } from '@/hooks/useResource';
import { useTheme } from '@/theme/ThemeProvider';

// ORGANISE: the events I own. Opening one shows the organiser tools (edit, delete, stalls, approvals).
export default function ManageScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { state, refreshing, refresh, reload, retry } = useMyEvents(user?.id ?? '');
  useRefreshOnFocus(reload);

  if (state.status === 'loading') return <LoadingView label="Loading your events..." />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;

  return (
    <FlatList
      data={state.data}
      keyExtractor={(e) => e.id}
      renderItem={({ item }) => <EventCard event={item} />}
      contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        <View style={{ gap: theme.spacing.s }}>
          {state.fromCache ? (
            <Banner icon="cloud-offline-outline" tone="warning" message="You are offline. Showing saved events." />
          ) : null}
          <Button label="New event" icon="add" onPress={() => router.push('/event-form')} />
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon="megaphone-outline"
          title="You are not organising anything"
          message="Publish a market, fair or expo, add stalls, and vendors can request them."
          actionLabel="Create your first event"
          onAction={() => router.push('/event-form')}
        />
      }
    />
  );
}