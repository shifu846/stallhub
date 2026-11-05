import { Alert } from 'react-native';

import { describeError } from '@/services/errors';

// Every destructive action goes through this: the brief requires a confirmation dialog on delete.
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void | Promise<void>
) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: confirmLabel,
      style: 'destructive',
      onPress: () => {
        void onConfirm();
      },
    },
  ]);
}

export function showError(error: unknown, title = 'Something went wrong') {
  Alert.alert(title, describeError(error));
}