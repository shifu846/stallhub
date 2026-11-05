import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/services/auth';
import { cardStyle } from '@/theme/helpers';
import { ThemeMode, useTheme } from '@/theme/ThemeProvider';
import { confirmDestructive, showError } from '@/utils/dialogs';

const MODES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function ProfileScreen() {
  const { theme, mode, setMode } = useTheme();
  const { user, displayName } = useAuth();
  const [busy, setBusy] = useState(false);
  const initial = (displayName || '?').trim().charAt(0).toUpperCase();

  const signOut = () =>
    confirmDestructive('Log out?', 'Saved events and cached data are cleared from this phone.', 'Log out', async () => {
      setBusy(true);
      try {
        await logout(); // the protected-route guard moves the user to the login screen
      } catch (error) {
        showError(error);
        setBusy(false);
      }
    });

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
      <View style={[cardStyle(theme), { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.m }]}>
        <View
          accessibilityElementsHidden
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.primary,
          }}>
          <AppText variant="h1" color={theme.colors.onPrimary}>
            {initial}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="title">{displayName}</AppText>
          <AppText muted variant="small">
            {user?.email}
          </AppText>
        </View>
      </View>

      <View style={cardStyle(theme)}>
        <AppText variant="title">Appearance</AppText>
        <View
          accessibilityRole="radiogroup"
          style={{
            flexDirection: 'row',
            gap: theme.spacing.s,
            padding: theme.spacing.xs,
            borderRadius: theme.radius.m,
            backgroundColor: theme.colors.background,
          }}>
          {MODES.map((m) => {
            const selected = mode === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                accessibilityRole="radio"
                accessibilityLabel={`${m.label} theme`}
                accessibilityState={{ selected }}
                style={{
                  flex: 1,
                  minHeight: theme.touch.min,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radius.s,
                  backgroundColor: selected ? theme.colors.primary : 'transparent',
                }}>
                <AppText bold={selected} color={selected ? theme.colors.onPrimary : theme.colors.text}>
                  {m.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={cardStyle(theme)}>
        <AppText variant="title">Organiser tools</AppText>
        <AppText muted>Create events and manage stall requests from the Organise tab.</AppText>
        <Button label="Create an event" icon="add" variant="secondary" onPress={() => router.push('/event-form')} />
      </View>

      <Button
        label="Log out"
        icon="log-out-outline"
        variant="danger"
        onPress={signOut}
        busy={busy}
        busyLabel="Logging out..."
      />
    </ScrollView>
  );
}