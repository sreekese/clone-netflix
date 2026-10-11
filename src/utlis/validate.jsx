export function checkValidateForm(
  email,
  password,
  isSignUp = false,
  name = '',
) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  if (isSignUp && !name.trim()) return 'Enter your full name.';
  if (isSignUp && password.length < 8)
    return 'Use at least 8 characters for your password.';
  return null;
}

export function authErrorMessage(error) {
  const messages = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/email-already-in-use':
      'An account already exists with this email. Please sign in.',
    'auth/weak-password':
      'Choose a stronger password with at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Check your connection and try again.',
  };
  return (
    messages[error.code] || 'Unable to complete your request. Please try again.'
  );
}
