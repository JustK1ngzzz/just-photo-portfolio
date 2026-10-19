const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const SESSION_KEY = 'admin_authenticated';

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}
