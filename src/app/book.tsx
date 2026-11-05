import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { useStall } from '@/hooks/useEvents';
import { createBooking } from '@/services/bookings';
import { describeError } from '@/services/errors';
import { cardStyle } from '@/theme/helpers';
import { useTheme } from '@/theme/ThemeProvider';
import type { StallWithEvent } from '@/types';
import { formatDate, formatKina, formatTime } from '@/utils/format';

// BOOK A STALL (Create a booking). The route carries only the stall id; the screen re-reads the stall.
export default function BookRoute() {
  const { stallId } = useLocalSearchParams<{ stallId?: string }>();
  if (!stallId) return <ErrorState message="No stall was selected." onRetry={() => router.back()} />;
  return <BookLoader stallId={stallId} />;
}

function BookLoader({ stallId }: { stallId: string }) {
  const { state, retry } = useStall(stallId);
  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;
  return <BookForm stall={state.data} />;
}

function BookForm({ stall }: { stall: StallWithEvent }) {
  const { theme } = useTheme();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (note.length > 200) {
      setError('Keep your note under 200 characters');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createBooking(stall.id, note);
      router.back();
      Alert.alert('Request sent', 'The organiser will approve or reject it. Track it in My bookings.');
    } catch (e) {
      setError(describeError(e));
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
        <View style={cardStyle(theme)}>
          <AppText variant="title">{stall.name}</AppText>
          <AppText muted>
            {stall.category} - {formatKina(stall.price)}
          </AppText>
          <AppText>{stall.event.title}</AppText>
          <AppText variant="small" muted>
            {formatDate(stall.event.starts_at)} at {formatTime(stall.event.starts_at)} - {stall.event.venue}
          </AppText>
        </View>
        {error ? <Banner icon="alert-circle-outline" tone="danger" message={error} /> : null}
        <TextField label="Note to the organiser (optional)" value={note} onChangeText={setNote} multiline
          maxLength={200} placeholder="What will you sell? Any special needs?" />
        <Button label="Send request" icon="send-outline" onPress={submit} busy={busy} busyLabel="Sending..." />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}