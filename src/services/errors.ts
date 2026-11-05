// One place that turns any thrown value into a short, human sentence for the UI.
type ErrorLike = { message?: unknown };

function messageOf(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as ErrorLike).message);
  return '';
}

export function isOfflineError(error: unknown): boolean {
  return /network request failed|failed to fetch|timed out|timeout|aborted|offline/i.test(messageOf(error));
}

export function describeError(error: unknown): string {
  const message = messageOf(error);
  if (isOfflineError(error)) return 'No connection. Check your internet and try again.';
  if (/invalid login credentials/i.test(message)) return 'Wrong email or password.';
  if (/already (been )?registered/i.test(message)) return 'That email already has an account. Try logging in.';
  if (/email not confirmed/i.test(message)) return 'Please confirm your email first, then log in.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Please wait a minute and try again.';
  if (/duplicate key|one_active_booking/i.test(message)) return 'Someone else has just requested that stall.';
  if (/row-level security|permission denied|multiple \(or no\) rows/i.test(message)) {
    return 'That item was not found, or you do not have permission to change it.';
  }
  return 'Something went wrong. Please try again.';
}