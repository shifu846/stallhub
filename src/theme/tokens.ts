const lightColors = {
  primary: '#B8470F',
  onPrimary: '#FFFFFF',
  background: '#F7F5F2',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#5B6577',
  border: '#E2DDD6',
  danger: '#B4443C',
  onDanger: '#FFFFFF',
  success: '#2E7D4F',
  warning: '#8A5A00',
  skeleton: '#E9E4DC',
};

const darkColors: typeof lightColors = {
  primary: '#FF9A5C',
  onPrimary: '#1A0A02',
  background: '#12100E',
  surface: '#1B1815',
  surfaceRaised: '#25211D',
  text: '#F1ECE6',
  textMuted: '#AEA79D',
  border: '#37312B',
  danger: '#F08A80',
  onDanger: '#1A0A02',
  success: '#6FCF97',
  warning: '#E3B341',
  skeleton: '#2A2520',
};

const spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32 } as const;
const radius = { s: 6, m: 12, l: 20, pill: 999 } as const;
const text = { caption: 12, small: 14, body: 16, title: 20, h1: 26 } as const;
const lineHeight = { caption: 16, small: 20, body: 22, title: 26, h1: 32 } as const;
const fonts = { regular: 'Inter_400Regular', bold: 'Inter_700Bold' } as const;
const touch = { min: 44 } as const;

export type ColorTokens = typeof lightColors;
export type ColorScheme = 'light' | 'dark';

export type Theme = {
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  text: typeof text;
  lineHeight: typeof lineHeight;
  fonts: typeof fonts;
  touch: typeof touch;
};

export function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    text,
    lineHeight,
    fonts,
    touch,
  };
}