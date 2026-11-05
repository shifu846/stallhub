import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'caption' | 'small' | 'body' | 'title' | 'h1';
type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  bold?: boolean;
  color?: string;
  style?: StyleProp<TextStyle>;
};

// All text in the app goes through here, so size, font and colour always come from the theme.
export function AppText({ variant = 'body', muted, bold, color, style, ...rest }: Props) {
  const { theme } = useTheme();
  const heavy = bold || variant === 'title' || variant === 'h1';
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: heavy ? theme.fonts.bold : theme.fonts.regular,
          fontSize: theme.text[variant],
          lineHeight: theme.lineHeight[variant],
          color: color ?? (muted ? theme.colors.textMuted : theme.colors.text),
        },
        style,
      ]}
    />
  );
}