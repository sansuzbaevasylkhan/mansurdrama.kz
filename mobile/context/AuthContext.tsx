import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '@/lib/endpoints';
import { userStore } from '@/lib/token-store';
import type { PublicUser } from '@/lib/token-store';

interface AuthContextType {
  user: PublicUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = await userStore.getToken();
      if (storedToken) {
        setToken(storedToken);
        const res = await userApi.me();
        if (res && res.user) {
          setUser(res.user);
        } else {
          await logout();
        }
      }
    } catch (err) {
      console.error('Auth init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await userApi.login({ email, password });
      if (res && res.token && res.user) {
        await userStore.setToken(res.token);
        await userStore.setUser(res.user);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Кіру сәтсіздікке ұшырады' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Кіру қатесі' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await userApi.register({ name, email, password });
      if (res && res.token && res.user) {
        await userStore.setToken(res.token);
        await userStore.setUser(res.user);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Тіркелу сәтсіздікке ұшырады' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Тіркелу қатесі' };
    }
  };

  const logout = async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      await userStore.clear();
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await userApi.me();
      if (res && res.user) {
        setUser(res.user);
      } else {
        await logout();
      }
    } catch (err) {
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
