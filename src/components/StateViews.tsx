import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { IconName } from '@/types';
import { AppText } from './AppText';
import { Button } from './Button';

// The four states of every data screen: loading, success (the screen itself), empty and error.
export function LoadingView({ label = 'Loading...' }: { label?: string }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.s,
        padding: theme.spacing.l,
      }}>
      <ActivityIndicator size="large" color={theme.colors.primary} accessibilityLabel={label} />
      <AppText muted>{label}</AppText>
    </View>
  );
}

type EmptyProps = { icon: IconName; title: string; message: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyProps) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: theme.spacing.s, padding: theme.spacing.xl }}>
      <Ionicons name={icon} size={56} color={theme.colors.textMuted} />
      <AppText variant="title" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText muted style={{ textAlign: 'center' }}>
        {message}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} fullWidth={false} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.s,
        padding: theme.spacing.xl,
      }}>
      <Ionicons name="alert-circle-outline" size={56} color={theme.colors.danger} />
      <AppText variant="title" style={{ textAlign: 'center' }}>
        Could not load
      </AppText>
      <AppText muted style={{ textAlign: 'center' }}>
        {message}
      </AppText>
      <Button label="Try again" icon="refresh-outline" onPress={onRetry} fullWidth={false} />
    </View>
  );
}