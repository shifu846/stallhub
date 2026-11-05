import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/Button';

// Temporary Organise screen: replaced by the full version in Step 18.
export default function ManageScreen() {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Button label="New event" icon="add" onPress={() => router.push('/event-form')} />
    </View>
  );
}