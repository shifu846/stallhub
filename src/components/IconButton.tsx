import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import type { IconName } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';

type Props = { icon: IconName; label: string; onPress: () => void; color?: string; disabled?: boolean };

// Icon-only buttons MUST have a label, otherwise a screen reader announces nothing useful.
export function IconButton({ icon, label, onPress, color, disabled = false }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({
        width: theme.touch.min,
        height: theme.touch.min,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
      })}>
      <Ionicons name={icon} size={24} color={color ?? theme.colors.text} />
    </Pressable>
  );
}