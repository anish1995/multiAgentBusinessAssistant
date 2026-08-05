const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export type AuthResponse = {
  token: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  refreshExpiresInMs: number;
  email: string;
  fullName: string;
  role: string;
};

export type AuthUser = {
  email: string;
  fullName: string;
  role: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() || getRefreshToken());
}

export function isAdmin(): boolean {
  const user = getUser();
  if (!user?.role) {
    return false;
  }
  return user.role.toUpperCase() === "ADMIN" || user.role.toUpperCase() === "ROLE_ADMIN";
}

export function setSession(auth: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      email: auth.email,
      fullName: auth.fullName,
      role: auth.role,
    }),
  );

  const accessMaxAge = Math.floor(auth.expiresInMs / 1000);
  document.cookie = `auth_token=${auth.token}; path=/; max-age=${accessMaxAge}; SameSite=Lax`;

  const refreshMaxAge = Math.floor(auth.refreshExpiresInMs / 1000);
  document.cookie = `auth_refresh_token=${auth.refreshToken}; path=/; max-age=${refreshMaxAge}; SameSite=Lax`;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "auth_refresh_token=; path=/; max-age=0";
}

export function logoutLocal(): void {
  clearSession();
  window.location.href = "/login";
}
