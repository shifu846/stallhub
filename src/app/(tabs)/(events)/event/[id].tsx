import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, ScrollView, Share, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { StallRow } from '@/components/StallRow';
import { WeatherCard } from '@/components/WeatherCard';
import { useAuth } from '@/context/AuthContext';
import { useEventDetail } from '@/hooks/useEvents';
import { useRefreshOnFocus } from '@/hooks/useResource';
import { useReminder } from '@/hooks/useReminder';
import { decideBooking } from '@/services/bookings';
import { deleteEvent } from '@/services/events';
import { deleteStall } from '@/services/stalls';
import { useTheme } from '@/theme/ThemeProvider';
import type { EventDetail, IconName, Stall } from '@/types';
import { confirmDestructive, showError } from '@/utils/dialogs';
import { formatDate, formatTime } from '@/utils/format';
import { describeStall } from '@/utils/stalls';

// EVENT DETAIL (Read + Delete): everything about one event. The organiser also gets edit / delete / stall tools.
export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { state, refreshing, refresh, reload, retry } = useEventDetail(id);
  useRefreshOnFocus(reload);

  if (state.status === 'loading') return <LoadingView label="Loading event..." />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;
  return (
    <EventDetailBody
      event={state.data}
      fromCache={state.fromCache}
      userId={user?.id ?? ''}
      refreshing={refreshing}
      onRefresh={refresh}
      reload={reload}
    />
  );
}

type BodyProps = {
  event: EventDetail;
  fromCache: boolean;
  userId: string;
  refreshing: boolean;
  onRefresh: () => void;
  reload: () => Promise<void>;
};

function InfoLine({ icon, text }: { icon: IconName; text: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
      <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
      <AppText muted style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

function EventDetailBody({ event, fromCache, userId, refreshing, onRefresh, reload }: BodyProps) {
  const { theme } = useTheme();
  const isOwner = event.owner_id === userId;
  const reminder = useReminder(event.id, event.title, event.starts_at);
  const [busyId, setBusyId] = useState<string | null>(null);

  const share = () => {
    const link = Linking.createURL(`/event/${event.id}`);
    void Share.share({ message: `${event.title} - ${formatDate(event.starts_at)} in ${event.town}\n${link}` });
  };

  const toggleReminder = async () => {
    const message = await reminder.toggle();
    if (message) Alert.alert('Reminder', message);
  };

  const removeEvent = () =>
    confirmDestructive(
      'Delete this event?',
      'Its stalls and booking requests will be deleted too. This cannot be undone.',
      'Delete event',
      async () => {
        try {
          await deleteEvent(event.id);
          router.back();
        } catch (error) {
          showError(error);
        }
      }
    );

  const removeStall = (stall: Stall) =>
    confirmDestructive(
      `Delete ${stall.name}?`,
      'Any booking request for this stall will be deleted too.',
      'Delete stall',
      async () => {
        try {
          await deleteStall(stall.id);
          await reload();
        } catch (error) {
          showError(error);
        }
      }
    );

  const decide = async (bookingId: string, status: 'approved' | 'rejected') => {
    setBusyId(bookingId);
    try {
      await decideBooking(bookingId, status);
      await reload();
    } catch (error) {
      showError(error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: event.title,
          headerRight: () => <IconButton icon="share-social-outline" label="Share this event" onPress={share} />,
        }}
      />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
        {event.poster_url ? (
          <Image
            source={event.poster_url}
            contentFit="cover"
            transition={200}
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: theme.radius.m }}
            accessibilityLabel={`Poster for ${event.title}`}
          />
        ) : null}
        {fromCache ? (
          <Banner icon="cloud-offline-outline" tone="warning" message="You are offline. Showing saved details." />
        ) : null}

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="h1">{event.title}</AppText>
          <InfoLine icon="calendar-outline" text={`${formatDate(event.starts_at)} at ${formatTime(event.starts_at)}`} />
          <InfoLine icon="location-outline" text={`${event.venue}, ${event.town}`} />
        </View>
        {event.description ? <AppText>{event.description}</AppText> : null}

        <View style={{ gap: theme.spacing.s }}>
          <Button
            label={reminder.enabled ? 'Reminder on (tap to cancel)' : 'Remind me before it starts'}
            icon={reminder.enabled ? 'notifications-off-outline' : 'notifications-outline'}
            variant="secondary"
            busy={reminder.busy}
            onPress={toggleReminder}
          />
          {isOwner ? (
            <>
              <Button label="Edit event" icon="create-outline" variant="secondary"
                onPress={() => router.push({ pathname: '/event-form', params: { id: event.id } })} />
              <Button label="Delete event" icon="trash-outline" variant="danger" onPress={removeEvent} />
            </>
          ) : null}
        </View>

        <WeatherCard latitude={event.latitude} longitude={event.longitude} startsAt={event.starts_at} />

        <View style={{ gap: theme.spacing.s }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText variant="title" style={{ flex: 1 }}>
              Stalls ({event.stalls.length})
            </AppText>
            {isOwner ? (
              <Button label="Add stall" icon="add" fullWidth={false}
                onPress={() => router.push({ pathname: '/stall-form', params: { eventId: event.id } })} />
            ) : null}
          </View>
          {event.stalls.length === 0 ? (
            <AppText muted>
              {isOwner
                ? 'No stalls yet. Add your first stall so vendors can request it.'
                : 'The organiser has not added any stalls yet.'}
            </AppText>
          ) : (
            event.stalls.map((stall) => {
              const view = describeStall(stall, event.bookings, userId, isOwner);
              return (
                <StallRow
                  key={stall.id}
                  stall={stall}
                  view={view}
                  isOwner={isOwner}
                  busy={busyId !== null && busyId === view.decidable?.id}
                  onBook={() => router.push({ pathname: '/book', params: { stallId: stall.id } })}
                  onDecide={decide}
                  onEdit={() => router.push({ pathname: '/stall-form', params: { stallId: stall.id } })}
                  onDelete={() => removeStall(stall)}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}