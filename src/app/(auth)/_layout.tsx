import { Stack } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';

// Without this, the first file alphabetically (forgot-password) would open first.
export const unstable_settings = { initialRouteName: 'login' };

export default function AuthStackLayout() {
  const { theme } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />;
}