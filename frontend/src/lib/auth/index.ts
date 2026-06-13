const TOKEN_KEY = 'acrg_auth_token';

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = (): void => localStorage.removeItem(TOKEN_KEY);
