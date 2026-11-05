import { forwardRef } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';

type Props = TextInputProps & { label: string; error?: string | null; hint?: string };

// A labelled, controlled input. The error sits directly under the field it belongs to.
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, style, ...rest },
  ref
) {
  const { theme } = useTheme();
  const { colors } = theme;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="small" bold>
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        {...rest}
        style={[
          {
            minHeight: theme.touch.min + 4,
            borderWidth: 1.5,
            borderRadius: theme.radius.m,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            fontFamily: theme.fonts.regular,
            fontSize: theme.text.body,
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
          rest.multiline ? { minHeight: 96, textAlignVertical: 'top' } : null,
          style,
        ]}
      />
      {error ? (
        <AppText variant="small" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" muted>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});