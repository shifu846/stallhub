import { Stack } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';

// A STACK nested inside the Events tab: list -> detail keeps the tab bar visible, and the detail URL is
// simply /event/<id>, which makes it deep-linkable (stallhub://event/<id>).
// If the app opens straight at an event (deep link), the list is put underneath so "back" works.
export const unstable_settings = { initialRouteName: 'index' };

export default function EventsStackLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: theme.fonts.bold },
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Events' }} />
      <Stack.Screen name="event/[id]" options={{ title: 'Event' }} />
    </Stack>
  );
}