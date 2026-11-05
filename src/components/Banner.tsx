import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { toneColor } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import type { IconName, Tone } from '@/types';
import { AppText } from './AppText';

type Props = { icon: IconName; message: string; tone?: Tone };

export function Banner({ icon, message, tone = 'info' }: Props) {
  const { theme } = useTheme();
  const color = toneColor(theme, tone);
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        padding: theme.spacing.s + 4,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: theme.colors.surface,
      }}>
      <Ionicons name={icon} size={20} color={color} />
      <AppText variant="small" style={{ flex: 1 }}>
        {message}
      </AppText>
    </View>
  );
}