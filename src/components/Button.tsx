import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable } from 'react-native';

import type { IconName } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: IconName;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
};

// Busy buttons ignore further taps: this is what stops double submits.
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  busy = false,
  busyLabel,
  disabled = false,
  fullWidth = true,
  accessibilityHint,
}: Props) {
  const { theme } = useTheme();
  const { colors } = theme;
  const inactive = disabled || busy;
  const background = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const foreground = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.onDanger : colors.primary;
  const shown = busy ? (busyLabel ?? label) : label;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={shown}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy }}
      style={({ pressed }) => ({
        minHeight: theme.touch.min + 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.s,
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.radius.m,
        borderWidth: 1.5,
        borderColor: variant === 'secondary' ? colors.primary : background,
        backgroundColor: background,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
      })}>
      {busy ? (
        <ActivityIndicator color={foreground} />
      ) : icon ? (
        <Ionicons name={icon} size={20} color={foreground} />
      ) : null}
      <AppText bold color={foreground}>
        {shown}
      </AppText>
    </Pressable>
  );
}