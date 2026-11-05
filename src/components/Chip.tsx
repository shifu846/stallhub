import { Pressable } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';

type Props = { label: string; selected: boolean; onPress: () => void };

// A selectable option (town, category, filter). Selected state is announced to screen readers.
export function Chip({ label, selected, onPress }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      hitSlop={4}
      style={{
        minHeight: theme.touch.min - theme.spacing.s,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.m,
        borderRadius: theme.radius.pill,
        borderWidth: 1.5,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
      }}>
      <AppText variant="small" color={selected ? theme.colors.onPrimary : theme.colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}