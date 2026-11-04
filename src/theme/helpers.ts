import type { ViewStyle } from 'react-native';

import type { Tone } from '@/types';
import type { Theme } from './tokens';

// One place that maps a semantic tone to a colour, so Pill and Banner never disagree.
export function toneColor(theme: Theme, tone: Tone): string {
  const c = theme.colors;
  switch (tone) {
    case 'success':
      return c.success;
    case 'warning':
      return c.warning;
    case 'danger':
      return c.danger;
    case 'info':
      return c.primary;
    default:
      return c.textMuted;
  }
}

// The shared "card" look used by cards, forms and panels.
export function cardStyle(theme: Theme): ViewStyle {
  return {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.l,
    padding: theme.spacing.m,
    gap: theme.spacing.s,
  };
}