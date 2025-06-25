'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginForm = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setAuthDialogOpen } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleForgotPassword = () => {
    setAuthDialogOpen(false);
    router.push('/forgot-password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">{t('email')}</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">{t('password')}</Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="text-right text-sm">
          <Button type="button" variant="link" className="p-0 h-auto font-normal text-muted-foreground" onClick={handleForgotPassword}>
            {t('forgotPassword')}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('login')}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t('dontHaveAccount')}{' '}
        <Button variant="link" type="button" onClick={onSwitchToRegister} className="p-0 h-auto">
          {t('register')}
        </Button>
      </p>
    </form>
  );
};

const RegisterForm = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(email, password);
    if (success) {
        onSwitchToLogin();
    }
    setIsLoading(false);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">{t('email')}</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">{t('password')}</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <p className="text-xs text-muted-foreground">{t('passwordMinLength')}</p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('register')}
      </Button>
       <p className="text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <Button variant="link" type="button" onClick={onSwitchToLogin} className="p-0 h-auto">
          {t('login')}
        </Button>
      </p>
    </form>
  );
};


export function AuthDialog() {
  const { isAuthDialogOpen, setAuthDialogOpen } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('login');

  return (
    <Dialog open={isAuthDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">
                    {activeTab === 'login' ? t('loginToBito') : t('createBitoAccount')}
                </DialogTitle>
                <DialogDescription className="text-center">
                    {t('authDescription')}
                </DialogDescription>
            </DialogHeader>
            <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="login">{t('login')}</TabsTrigger>
                <TabsTrigger value="register">{t('register')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-4">
               <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
            </TabsContent>
            <TabsContent value="register" className="pt-4">
               <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
