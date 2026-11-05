import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { cardStyle } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import { useSaved } from '@/store/saved';
import type { EventSummary } from '@/types';
import { formatDate, formatTime } from '@/utils/format';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { Pill } from './Pill';

// Memoised because FlatList calls renderItem a lot.
function EventCardBase({ event }: { event: EventSummary }) {
  const { theme } = useTheme();
  const saved = useSaved((s) => s.ids.includes(event.id));
  const toggleSaved = useSaved((s) => s.toggle);
  const free = event.stalls.filter((s) => !s.is_reserved).length;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatDate(event.starts_at)}, ${event.town}`}
      accessibilityHint="Opens event details"
      style={({ pressed }) => [cardStyle(theme), { padding: 0, overflow: 'hidden', opacity: pressed ? 0.85 : 1 }]}>
      {event.poster_url ? (
        <Image
          source={event.poster_url}
          contentFit="cover"
          transition={200}
          style={{ width: '100%', aspectRatio: 16 / 9 }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View
          style={{
            aspectRatio: 16 / 9,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.skeleton,
          }}>
          <Ionicons name="calendar-outline" size={40} color={theme.colors.textMuted} />
        </View>
      )}
      <View style={{ padding: theme.spacing.m, gap: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppText variant="title" numberOfLines={2} style={{ flex: 1 }}>
            {event.title}
          </AppText>
          <IconButton
            icon={saved ? 'heart' : 'heart-outline'}
            label={saved ? 'Remove from saved events' : 'Save this event'}
            color={saved ? theme.colors.danger : theme.colors.textMuted}
            onPress={() => toggleSaved(event.id)}
          />
        </View>
        <AppText variant="small" muted>
          {formatDate(event.starts_at)} - {formatTime(event.starts_at)}
        </AppText>
        <AppText variant="small" muted numberOfLines={1}>
          {event.venue}, {event.town}
        </AppText>
        <Pill
          label={event.stalls.length === 0 ? 'No stalls yet' : `${free} of ${event.stalls.length} stalls free`}
          tone={event.stalls.length === 0 ? 'neutral' : free > 0 ? 'success' : 'danger'}
        />
      </View>
    </Pressable>
  );
}

export const EventCard = memo(EventCardBase);