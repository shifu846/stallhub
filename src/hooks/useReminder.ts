import { useCallback, useEffect, useState } from 'react';

import { cancelReminder, hasReminder, ReminderResult, scheduleReminder } from '@/services/notifications';

const MESSAGES: Record<Exclude<ReminderResult, 'scheduled'>, string> = {
  unsupported: 'Reminders need the installed app. They are not available in Expo Go on Android.',
  denied: 'Notifications are turned off. You can allow them in your phone Settings.',
  'too-soon': 'This event starts too soon for a reminder.',
};

export function useReminder(eventId: string, title: string, startsAt: string) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    hasReminder(eventId).then((value) => {
      if (active) setEnabled(value);
    });
    return () => {
      active = false;
    };
  }, [eventId]);

  // Returns a message to show the user when something prevented the change, otherwise null.
  const toggle = useCallback(async (): Promise<string | null> => {
    setBusy(true);
    try {
      if (enabled) {
        await cancelReminder(eventId);
        setEnabled(false);
        return null;
      }
      const result = await scheduleReminder(eventId, title, startsAt);
      if (result === 'scheduled') {
        setEnabled(true);
        return null;
      }
      return MESSAGES[result];
    } catch {
      return 'Could not change the reminder. Please try again.';
    } finally {
      setBusy(false);
    }
  }, [enabled, eventId, title, startsAt]);

  return { enabled, busy, toggle };
}