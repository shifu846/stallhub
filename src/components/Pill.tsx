import { View } from 'react-native';

import { toneColor } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import type { Tone } from '@/types';
import { AppText } from './AppText';

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const { theme } = useTheme();
  const color = toneColor(theme, tone);
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: color,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.s + 2,
        paddingVertical: 2,
      }}>
      <AppText variant="caption" bold color={color}>
        {label}
      </AppText>
    </View>
  );
}