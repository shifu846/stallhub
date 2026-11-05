import { Inter_400Regular, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppThemeProvider, useTheme } from '@/theme/ThemeProvider';

// Keep the native splash visible until fonts, the saved theme and the saved session are ready.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </AppThemeProvider>
  );
}

// Protected routes: the guard re-evaluates whenever the session changes, so login and logout
// move the user between the two groups automatically. Logged-out users cannot reach the tabs,
// even by deep link, because those screens do not exist in the navigator for them.
function RootNavigator() {
  const { theme, ready: themeReady } = useTheme();
  const { session, ready: authReady } = useAuth();
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

  const ready = fontsLoaded && authReady && themeReady;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontFamily: theme.fonts.bold },
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="event-form" options={{ presentation: 'modal', title: 'Event' }} />
          <Stack.Screen name="stall-form" options={{ presentation: 'modal', title: 'Stall' }} />
          <Stack.Screen name="book" options={{ presentation: 'modal', title: 'Request a stall' }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}