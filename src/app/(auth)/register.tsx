import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { TextLink } from '@/components/TextLink';
import { register } from '@/services/auth';
import { describeError } from '@/services/errors';
import { isEmail } from '@/utils/validators';

type Errors = { name?: string; email?: string; password?: string; confirm?: string };

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const submit = async () => {
    if (busy) return;
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name (at least 2 characters)';
    if (!isEmail(email)) next.email = 'Enter a valid email, e.g. name@example.com';
    if (password.length < 6) next.password = 'Use at least 6 characters';
    if (confirm !== password) next.confirm = 'The two passwords do not match';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    setServerError(null);
    try {
      const result = await register(email, password, name);
      // With email confirmation off the guard signs the user straight in; with it on we tell them to check mail.
      if (result.needsEmailConfirmation) {
        setCheckEmail(true);
        setBusy(false);
      }
    } catch (error) {
      setServerError(describeError(error));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Organise events or book a stall at one.">
      {serverError ? <Banner icon="alert-circle-outline" tone="danger" message={serverError} /> : null}
      {checkEmail ? (
        <Banner
          icon="mail-outline"
          tone="success"
          message="Account created. Check your email to confirm it, then log in."
        />
      ) : null}
      <TextField
        label="Your name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Maria Kila"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        error={errors.name}
      />
      <TextField
        ref={emailRef}
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="name@example.com"
        autoCapitalize="none"
        autoCorrect={false}
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
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        error={errors.password}
      />
      <TextField
        ref={confirmRef}
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={errors.confirm}
      />
      <Button label="Create account" icon="person-add-outline" onPress={submit} busy={busy} busyLabel="Creating..." />
      <TextLink label="I already have an account" onPress={() => router.back()} />
    </AuthLayout>
  );
}