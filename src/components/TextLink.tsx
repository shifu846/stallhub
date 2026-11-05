import { Pressable } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      hitSlop={8}
      style={{ minHeight: theme.touch.min, justifyContent: 'center' }}>
      <AppText bold color={theme.colors.primary} style={{ textAlign: 'center' }}>
        {label}
      </AppText>
    </Pressable>
  );
}