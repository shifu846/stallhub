import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { IconButton } from '@/components/IconButton';
import { Pill } from '@/components/Pill';
import { EmptyState, ErrorState, LoadingView } from '@/components/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useMyBookings } from '@/hooks/useBookings';
import { useRefreshOnFocus } from '@/hooks/useResource';
import { cancelBooking } from '@/services/bookings';
import { cardStyle } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import type { MyBooking, Tone } from '@/types';
import { confirmDestructive, showError } from '@/utils/dialogs';
import { formatDate, formatKina } from '@/utils/format';

const STATUS: Record<MyBooking['status'], { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

// MY BOOKINGS (Read + Delete for the vendor): the requests I have made.
export default function BookingsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { state, refreshing, refresh, reload, retry } = useMyBookings(user?.id ?? '');
  const [busyId, setBusyId] = useState<string | null>(null);
  useRefreshOnFocus(reload);

  const cancel = (booking: MyBooking) =>
    confirmDestructive(
      'Cancel this request?',
      `${booking.stall.name} at ${booking.stall.event.title} will be released for other vendors.`,
      'Cancel request',
      async () => {
        setBusyId(booking.id);
        try {
          await cancelBooking(booking.id);
          await reload();
        } catch (error) {
          showError(error);
        } finally {
          setBusyId(null);
        }
      }
    );

  if (state.status === 'loading') return <LoadingView label="Loading your bookings..." />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;

  return (
    <FlatList
      data={state.data}
      keyExtractor={(b) => b.id}
      contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m, flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      ListHeaderComponent={
        state.fromCache ? (
          <Banner icon="cloud-offline-outline" tone="warning" message="You are offline. Showing saved bookings." />
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          icon="ticket-outline"
          title="No stall requests yet"
          message="Find an event and request a stall. Your requests and their status appear here."
          actionLabel="Browse events"
          onAction={() => router.navigate('/')}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.stall.event.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${item.stall.name} at ${item.stall.event.title}, ${STATUS[item.status].label}`}
          accessibilityHint="Opens the event"
          style={cardStyle(theme)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
            <Ionicons name="ticket-outline" size={22} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <AppText bold>{item.stall.name}</AppText>
              <AppText variant="small" muted numberOfLines={1}>
                {item.stall.event.title}
              </AppText>
            </View>
            <IconButton icon="trash-outline" label={`Cancel request for ${item.stall.name}`}
              color={theme.colors.danger} disabled={busyId === item.id} onPress={() => cancel(item)} />
          </View>
          <AppText variant="small" muted>
            {formatDate(item.stall.event.starts_at)} - {formatKina(item.stall.price)}
          </AppText>
          <Pill label={STATUS[item.status].label} tone={STATUS[item.status].tone} />
        </Pressable>
      )}
    />
  );
}