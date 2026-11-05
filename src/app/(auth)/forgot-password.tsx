import { router } from 'expo-router';
import { useState } from 'react';

import { AuthLayout } from '@/components/AuthLayout';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { sendPasswordReset } from '@/services/auth';
import { describeError } from '@/services/errors';
import { isEmail } from '@/utils/validators';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!isEmail(email)) {
      setError('Enter the email you registered with');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      // The same message whether or not the account exists, so the form cannot be used to probe for users.
      setSent(true);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We will email you a link to choose a new password.">
      {sent ? (
        <Banner
          icon="mail-outline"
          tone="success"
          message="If that email has an account, a reset link is on its way."
        />
      ) : null}
      <TextField
        label="Email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (error) setError(null);
        }}
        placeholder="name@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={error}
      />
      <Button label="Send reset link" icon="send-outline" onPress={submit} busy={busy} busyLabel="Sending..." />
      <TextLink label="Back to log in" onPress={() => router.back()} />
    </AuthLayout>
  );
}