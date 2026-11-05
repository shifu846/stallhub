import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useWeather } from '@/hooks/useWeather';
import type { DayForecast } from '@/services/weather';
import { cardStyle } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import { localDateKey } from '@/utils/format';
import { describeWeather } from '@/utils/weatherCodes';
import { AppText } from './AppText';
import { Banner } from './Banner';
import { Button } from './Button';

type Props = { latitude: number | null; longitude: number | null; startsAt: string };

// API integration with all four states: loading, success, EMPTY (no coordinates / no data) and ERROR (with retry).
export function WeatherCard({ latitude, longitude, startsAt }: Props) {
  const { theme } = useTheme();
  return (
    <View style={cardStyle(theme)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
        <Ionicons name="partly-sunny-outline" size={22} color={theme.colors.primary} />
        <AppText variant="title">Weather forecast</AppText>
      </View>
      {latitude === null || longitude === null ? (
        <AppText muted>This event has no location yet. Edit the event and choose a town to see the forecast.</AppText>
      ) : (
        <Forecast latitude={latitude} longitude={longitude} startsAt={startsAt} />
      )}
    </View>
  );
}

function Forecast({ latitude, longitude, startsAt }: { latitude: number; longitude: number; startsAt: string }) {
  const { theme } = useTheme();
  const { state, retry } = useWeather(latitude, longitude);

  if (state.status === 'loading') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText muted>Loading forecast...</AppText>
      </View>
    );
  }
  if (state.status === 'error') {
    return (
      <View style={{ gap: theme.spacing.s }}>
        <Banner icon="alert-circle-outline" tone="danger" message={state.message} />
        <Button label="Try again" icon="refresh-outline" variant="secondary" fullWidth={false} onPress={retry} />
      </View>
    );
  }

  const days = state.data;
  if (days.length === 0) return <AppText muted>No forecast is available for this location right now.</AppText>;

  const eventKey = localDateKey(startsAt);
  const eventDay = days.find((d) => d.date === eventKey);
  const passed = eventKey < days[0].date;

  return (
    <View style={{ gap: theme.spacing.s }}>
      {state.fromCache ? (
        <Banner
          icon="cloud-offline-outline"
          tone="warning"
          message="Showing a saved forecast. It may be out of date."
        />
      ) : null}
      {passed ? (
        <AppText muted>This event has already taken place.</AppText>
      ) : eventDay ? (
        <DayRow day={eventDay} highlight />
      ) : (
        <AppText variant="small" muted>
          Forecasts cover the next 16 days. This event is later than that, so here is the week ahead.
        </AppText>
      )}
      {days.slice(0, 5).map((d) => (
        <DayRow key={d.date} day={d} highlight={false} />
      ))}
    </View>
  );
}

function DayRow({ day, highlight }: { day: DayForecast; highlight: boolean }) {
  const { theme } = useTheme();
  const info = describeWeather(day.code);
  const label = new Date(`${day.date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${info.label}, high ${day.max}, low ${day.min}, rain ${day.rainChance} percent`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        padding: theme.spacing.s + 2,
        borderRadius: theme.radius.m,
        borderWidth: highlight ? 2 : 1,
        borderColor: highlight ? theme.colors.primary : theme.colors.border,
      }}>
      <Ionicons name={info.icon} size={26} color={theme.colors.primary} />
      <View style={{ flex: 1 }}>
        <AppText bold>{highlight ? `Event day - ${label}` : label}</AppText>
        <AppText variant="small" muted>
          {info.label} - {day.rainChance}% rain
        </AppText>
      </View>
      <AppText bold>
        {day.max}
        {'\u00B0'} / {day.min}
        {'\u00B0'}
      </AppText>
    </View>
  );
}