export type AuthUserReader<TUser> = {
  getUser: () => Promise<{
    data: { user: TUser | null };
    error: { message: string; name?: string } | null;
  }>;
};

export type AuthUserResult<TUser> = {
  user: TUser | null;
  error: string | null;
};

function isUnauthenticatedError(error: { message: string; name?: string }) {
  return error.name === "AuthSessionMissingError"
    || /auth session missing|jwt.*expired|invalid.*jwt|refresh token.*not found|invalid refresh token/i.test(error.message);
}

export async function getAuthenticatedUser<TUser>(
  auth: AuthUserReader<TUser>,
  options: { attempts?: number; retryDelayMs?: number } = {},
): Promise<AuthUserResult<TUser>> {
  const attempts = Math.max(1, options.attempts ?? 2);
  const retryDelayMs = Math.max(0, options.retryDelayMs ?? 200);
  let lastError = "Não foi possível validar a sessão.";

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const { data, error } = await auth.getUser();

      if (!error) {
        return { user: data.user, error: null };
      }

      if (isUnauthenticatedError(error)) {
        return { user: null, error: null };
      }

      lastError = error.message || lastError;
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }

    if (attempt < attempts && retryDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return { user: null, error: lastError };
}
