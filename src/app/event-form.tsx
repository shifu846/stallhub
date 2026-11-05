import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TextField } from '@/components/TextField';
import { TOWNS } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useEventDetail } from '@/hooks/useEvents';
import { createEvent, updateEvent } from '@/services/events';
import { describeError } from '@/services/errors';
import { uploadPoster } from '@/services/storage';
import { useTheme } from '@/theme/ThemeProvider';
import type { EventDetail } from '@/types';
import { localDateKey, localTimeKey } from '@/utils/format';
import { EventFieldErrors, EventFormValues, parseStart, validateEvent } from '@/utils/validators';

const DRAFT_KEY = 'draft:event-form';
const EMPTY: EventFormValues = {
  title: '',
  description: '',
  venue: '',
  town: '',
  latitude: null,
  longitude: null,
  date: '',
  time: '',
};
const PHOTO_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.8,
  allowsEditing: true,
  aspect: [16, 9],
};

// Params carry IDENTITY only: /event-form?id=... means "edit"; no id means "create".
export default function EventFormRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return id ? <EditEvent id={id} /> : <EventForm initial={null} />;
}

function EditEvent({ id }: { id: string }) {
  const { state, retry } = useEventDetail(id);
  if (state.status === 'loading') return <LoadingView />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;
  return <EventForm initial={state.data} />;
}

function EventForm({ initial }: { initial: EventDetail | null }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [form, setForm] = useState<EventFormValues>(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description,
          venue: initial.venue,
          town: initial.town,
          latitude: initial.latitude,
          longitude: initial.longitude,
          date: localDateKey(initial.starts_at),
          time: localTimeKey(initial.starts_at),
        }
      : EMPTY
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<EventFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [locationNote, setLocationNote] = useState<{ tone: 'success' | 'warning'; text: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draftReady, setDraftReady] = useState(!!initial);

  const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // DRAFTS (Brief 3.3): restore an unfinished new event, and save every change after a short pause.
  useEffect(() => {
    if (initial) return;
    AsyncStorage.getItem(DRAFT_KEY)
      .then((raw) => {
        if (raw) setForm({ ...EMPTY, ...(JSON.parse(raw) as Partial<EventFormValues>) });
      })
      .catch(() => {})
      .finally(() => setDraftReady(true));
  }, [initial]);

  useEffect(() => {
    if (initial || !draftReady) return;
    const timer = setTimeout(() => {
      AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(form)).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [form, initial, draftReady]);

  const chooseTown = (name: string) => {
    const town = TOWNS.find((t) => t.name === name);
    if (!town) return;
    setForm((f) => ({ ...f, town: town.name, latitude: town.latitude, longitude: town.longitude }));
    setLocationNote(null);
  };

  const useMyLocation = async () => {
    setLocating(true);
    setLocationNote(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        // Design for "no": the form still works because a town can be chosen instead.
        setLocationNote({ tone: 'warning', text: 'Location permission was denied. Choose a town below instead.' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      setLocationNote({ tone: 'success', text: 'Using your current position for the weather forecast.' });
    } catch {
      setLocationNote({ tone: 'warning', text: 'Could not read your position. Try outdoors, or choose a town.' });
    } finally {
      setLocating(false);
    }
  };

  const pickPhoto = async (fromCamera: boolean) => {
    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera permission needed', 'Allow camera access in Settings, or choose a photo from the gallery.');
        return;
      }
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(PHOTO_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(PHOTO_OPTIONS);
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (busy || !user) return;
    const found = validateEvent(form, !initial);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const start = parseStart(form.date, form.time);
    if (!start) return;

    setBusy(true);
    setServerError(null);
    try {
      const posterUrl = photoUri ? await uploadPoster(photoUri, user.id) : (initial?.poster_url ?? null);
      const input = {
        title: form.title.trim(),
        description: form.description.trim(),
        venue: form.venue.trim(),
        town: form.town,
        latitude: form.latitude,
        longitude: form.longitude,
        starts_at: start.toISOString(),
        poster_url: posterUrl,
      };
      if (initial) {
        await updateEvent(initial.id, input);
      } else {
        await createEvent(input);
        await AsyncStorage.removeItem(DRAFT_KEY);
      }
      router.back();
    } catch (error) {
      setServerError(describeError(error));
      setBusy(false);
    }
  };

  const preview = photoUri ?? initial?.poster_url ?? null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: initial ? 'Edit event' : 'New event' }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: theme.spacing.m, gap: theme.spacing.m }}>
        {serverError ? <Banner icon="alert-circle-outline" tone="danger" message={serverError} /> : null}

        <View style={{ gap: theme.spacing.s }}>
          <AppText variant="small" bold>
            Poster photo (optional)
          </AppText>
          {preview ? (
            <Image
              source={preview}
              contentFit="cover"
              style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: theme.radius.m }}
              accessibilityLabel="Event poster preview"
            />
          ) : null}
          <View style={{ flexDirection: 'row', gap: theme.spacing.s }}>
            <View style={{ flex: 1 }}>
              <Button label="Take photo" icon="camera-outline" variant="secondary" onPress={() => pickPhoto(true)} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Gallery" icon="images-outline" variant="secondary" onPress={() => pickPhoto(false)} />
            </View>
          </View>
        </View>

        <TextField label="Event title" value={form.title} onChangeText={(v) => set('title', v)}
          placeholder="e.g. Lae Night Market" maxLength={80} error={errors.title} />
        <TextField label="Venue" value={form.venue} onChangeText={(v) => set('venue', v)}
          placeholder="e.g. Lae Main Market" maxLength={80} error={errors.venue} />

        <View style={{ gap: theme.spacing.s }}>
          <AppText variant="small" bold>
            Nearest town
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.s }}>
            {TOWNS.map((t) => (
              <Chip key={t.name} label={t.name} selected={form.town === t.name} onPress={() => chooseTown(t.name)} />
            ))}
          </View>
          {errors.town ? (
            <AppText variant="small" color={theme.colors.danger}>
              {errors.town}
            </AppText>
          ) : null}
          {locationNote ? (
            <Banner
              icon={locationNote.tone === 'success' ? 'checkmark-circle-outline' : 'warning-outline'}
              tone={locationNote.tone}
              message={locationNote.text}
            />
          ) : null}
          <Button label="Use my exact location" icon="navigate-outline" variant="secondary"
            onPress={useMyLocation} busy={locating} busyLabel="Finding you..." />
          <AppText variant="caption" muted>
            The location is used once, to look up the weather forecast for your event. It is never tracked.
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.s }}>
          <View style={{ flex: 1 }}>
            <TextField label="Date" value={form.date} onChangeText={(v) => set('date', v)}
              placeholder="2026-11-21" keyboardType="numbers-and-punctuation" maxLength={10} error={errors.date} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Start time" value={form.time} onChangeText={(v) => set('time', v)}
              placeholder="08:30" keyboardType="numbers-and-punctuation" maxLength={5} error={errors.time} />
          </View>
        </View>

        <TextField label="Description (optional)" value={form.description} multiline maxLength={500}
          onChangeText={(v) => set('description', v)} placeholder="What is on, who it is for, how to get there"
          error={errors.description} />

        <Button label={initial ? 'Save changes' : 'Publish event'} icon="checkmark" onPress={submit}
          busy={busy} busyLabel={initial ? 'Saving...' : 'Publishing...'} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}