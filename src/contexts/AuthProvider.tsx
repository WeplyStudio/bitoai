'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageProvider';

interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, username: string, pass: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateUserInContext: (updates: Partial<User>) => void;
  isAuthDialogOpen: boolean;
  setAuthDialogOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
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
      toast({ title: 'OTP Sent', description: data.message });
      router.push(`/otp?email=${encodeURIComponent(email)}`);
      setAuthDialogOpen(false);
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('loginErrorTitle'), description: error.message });
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        toast({ title: 'Registration Step 1 Complete', description: data.message });
        router.push(`/otp?email=${encodeURIComponent(email)}`);
        setAuthDialogOpen(false);
        return true;
    } catch (error: any) {
        toast({ variant: 'destructive', title: t('registerErrorTitle'), description: error.message });
        return false;
    }
  };
  
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }
      setUser(data);
      toast({ title: t('loginSuccessTitle'), description: t('loginSuccessDescription', { email: data.email }) });
      router.push('/');
      return true;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Verification Failed', description: error.message });
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast({ title: t('logoutSuccessTitle') });
      router.push('/'); // Redirect to home page on logout
    } catch (error) {
      toast({ variant: 'destructive', title: t('error'), description: 'Logout failed.' });
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('deleteAccountError'));
      }
      setUser(null);
      toast({ title: t('deleteAccountSuccessTitle'), description: t('deleteAccountSuccessDescription') });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    }
  };
  
  const updateUserInContext = useCallback((updates: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  }, []);

  const value = { user, isLoading, login, register, logout, verifyOtp, deleteAccount, updateUserInContext, isAuthDialogOpen, setAuthDialogOpen };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
