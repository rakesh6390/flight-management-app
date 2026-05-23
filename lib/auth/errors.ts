const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password. Please try again.",
  email_not_confirmed:
    "Please confirm your email before signing in. Check your inbox for the verification link.",
  user_already_registered:
    "An account with this email already exists. Try signing in instead.",
  weak_password: "Password is too weak. Use at least 8 characters with mixed case and a number.",
};

export function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return AUTH_ERROR_MESSAGES.invalid_credentials;
  }
  if (normalized.includes("email not confirmed")) {
    return AUTH_ERROR_MESSAGES.email_not_confirmed;
  }
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return AUTH_ERROR_MESSAGES.user_already_registered;
  }
  if (normalized.includes("password")) {
    return AUTH_ERROR_MESSAGES.weak_password;
  }

  return message;
}
