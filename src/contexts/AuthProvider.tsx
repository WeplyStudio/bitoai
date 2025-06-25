'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageProvider';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAuthDialogOpen: boolean;
  setAuthDialogOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string):Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setUser(data);
      toast({ title: t('loginSuccessTitle'), description: t('loginSuccessDescription', { email: data.email }) });
      setAuthDialogOpen(false);
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('loginErrorTitle'), description: error.message });
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        toast({ title: t('registerSuccessTitle'), description: t('registerSuccessDescription') });
        return true;
    } catch (error: any) {
        toast({ variant: 'destructive', title: t('registerErrorTitle'), description: error.message });
        return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast({ title: t('logoutSuccessTitle') });
    } catch (error) {
      toast({ variant: 'destructive', title: t('error'), description: 'Logout failed.' });
    }
  };

  const value = { user, isLoading, login, register, logout, isAuthDialogOpen, setAuthDialogOpen };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
