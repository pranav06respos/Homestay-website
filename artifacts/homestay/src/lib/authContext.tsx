import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

const STORAGE_KEY = 'neel_kamal_admin_jwt';

interface AuthContextType {
  token: string | null;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (typeof window !== 'undefined') {
      if (t) {
        localStorage.setItem(STORAGE_KEY, t);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

