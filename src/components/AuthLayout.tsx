import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from './AppText';

type Props = { title: string; subtitle: string; children: ReactNode };

// The three auth screens share this frame: safe area, keyboard handling, scrolling and a brand header.
export function AuthLayout({ title, subtitle, children }: Props) {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: theme.spacing.l,
            gap: theme.spacing.m,
          }}>
          <View style={{ alignItems: 'center', gap: theme.spacing.s, marginBottom: theme.spacing.m }}>
            <Ionicons name="storefront-outline" size={56} color={theme.colors.primary} />
            <AppText variant="h1">{title}</AppText>
            <AppText muted style={{ textAlign: 'center' }}>
              {subtitle}
            </AppText>
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}