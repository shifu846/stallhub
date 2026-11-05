// LOCAL notifications (Lecture 7): scheduled on the phone, no server needed.
// expo-notifications is loaded lazily with `await import`, and skipped inside Expo Go on Android where it
// cannot run. The feature degrades (the user is told) but the app survives. Remote push is NOT used.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');
export type ReminderResult = 'scheduled' | 'unsupported' | 'denied' | 'too-soon';

const CHANNEL_ID = 'reminders';
const HOUR = 60 * 60 * 1000;
const supported = !(isRunningInExpoGo() && Platform.OS === 'android');
let loaded: Promise<NotificationsModule> | null = null;

function load(): Promise<NotificationsModule> | null {
  if (!supported) return null;
  if (!loaded) {
    loaded = import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return Notifications;
    });
  }
  return loaded;
}

const storageKey = (eventId: string) => `reminder:${eventId}`;

export async function hasReminder(eventId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(storageKey(eventId))) !== null;
}

export async function scheduleReminder(eventId: string, title: string, startsAtIso: string): Promise<ReminderResult> {
  const Notifications = await load();
  if (!Notifications) return 'unsupported';

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Event reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  // Ask for permission IN CONTEXT (when the user taps "Remind me"), never at launch.
  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted && current.canAskAgain) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return 'denied';

  const start = new Date(startsAtIso).getTime();
  const when = [start - 24 * HOUR, start - HOUR].find((t) => t > Date.now() + 60000);
  if (!when) return 'too-soon';

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Event reminder',
      body: `${title} starts soon. Check your stall booking.`,
      data: { eventId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(when), channelId: CHANNEL_ID },
  });
  await AsyncStorage.setItem(storageKey(eventId), id);
  return 'scheduled';
}

export async function cancelReminder(eventId: string): Promise<void> {
  const id = await AsyncStorage.getItem(storageKey(eventId));
  if (!id) return;
  const Notifications = await load();
  if (Notifications) await Notifications.cancelScheduledNotificationAsync(id);
  await AsyncStorage.removeItem(storageKey(eventId));
}