import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { AppText } from '@/components/AppText';
import { AuthLayout } from '@/components/AuthLayout';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { login } from '@/services/auth';
import { describeError } from '@/services/errors';
import { isEmail } from '@/utils/validators';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (busy) return;
    const next: typeof errors = {};
    if (!isEmail(email)) next.email = 'Enter a valid email, e.g. name@example.com';
    if (password.length < 6) next.password = 'Your password has at least 6 characters';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    setServerError(null);
    try {
      await login(email, password);
      // No manual navigation: the protected-route guard sees the new session and swaps to the tabs.
    } catch (error) {
      setServerError(describeError(error));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="StallHub" subtitle="Find local events. Book your stall.">
      {serverError ? <Banner icon="alert-circle-outline" tone="danger" message={serverError} /> : null}
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        error={errors.email}
      />
      <TextField
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={errors.password}
      />
      <Button label="Log in" icon="log-in-outline" onPress={submit} busy={busy} busyLabel="Logging in..." />
      <TextLink label="Forgot your password?" onPress={() => router.push('/forgot-password')} />
      <AppText muted style={{ textAlign: 'center' }}>
        New here?
      </AppText>
      <Button label="Create an account" variant="secondary" onPress={() => router.push('/register')} />
    </AuthLayout>
  );
}