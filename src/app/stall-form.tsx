import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { STALL_CATEGORIES } from '@/constants';
import { useStall } from '@/hooks/useEvents';
import { describeError } from '@/services/errors';
import { createStall, updateStall } from '@/services/stalls';
import { useTheme } from '@/theme/ThemeProvider';
import type { StallWithEvent } from '@/types';
import { validateStall } from '@/utils/validators';

// /stall-form?eventId=... creates a stall; /stall-form?stallId=... edits one (pre-populated).
export default function StallFormRoute() {
  const { eventId, stallId } = useLocalSearchParams<{ eventId?: string; stallId?: string }>();
  if (stallId) return <EditStall stallId={stallId} />;
  if (eventId) return <StallForm eventId={eventId} initial={null} />;
  return <ErrorState message="No event was selected." onRetry={() => router.back()} />;
}

function EditStall({ stallId }: { stallId: string }) {
  const { state, retry } = useStall(stallId);
  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;
  return <StallForm eventId={state.data.event_id} initial={state.data} />;
}

function StallForm({ eventId, initial }: { eventId: string; initial: StallWithEvent | null }) {
  const { theme } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<string>(initial?.category ?? STALL_CATEGORIES[0]);
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const found = validateStall(name, price);
    setErrors(found);
    if (found.name || found.price) return;
    setBusy(true);
    setServerError(null);
    try {
      const input = { name: name.trim(), category, price: Number(price.replace(',', '.')) };
      if (initial) await updateStall(initial.id, input);
      else await createStall(eventId, input);
      router.back();
    } catch (error) {
      setServerError(describeError(error));
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: initial ? 'Edit stall' : 'New stall' }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
        {serverError ? <Banner icon="alert-circle-outline" tone="danger" message={serverError} /> : null}
        <TextField label="Stall name" value={name} onChangeText={setName} placeholder="e.g. Stall A1"
          maxLength={40} error={errors.name} />
        <View style={{ gap: theme.spacing.s }}>
          <AppText variant="small" bold>
            Category
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.s }}>
            {STALL_CATEGORIES.map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>
        <TextField label="Price (K)" value={price} onChangeText={setPrice} placeholder="50"
          keyboardType="decimal-pad" error={errors.price} />
        <Button label={initial ? 'Save stall' : 'Add stall'} icon="checkmark" onPress={submit}
          busy={busy} busyLabel="Saving..." />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}