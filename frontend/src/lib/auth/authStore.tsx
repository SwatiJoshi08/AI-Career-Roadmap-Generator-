import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'student' | 'career_mentor' | 'placement_officer' | 'career_content_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'acrg_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { token: null, user: null };
      }
    }
    return { token: null, user: null };
  });

  useEffect(() => {
    if (authState.token && authState.user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [authState]);

  const login = (token: string, user: User) => {
    setAuthState({ token, user });
  };

  const logout = () => {
    setAuthState({ token: null, user: null });
    // apiClient will redirect on next 401, or we can force redirect here
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isAuthenticated: !!authState.token,
        currentUser: authState.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
