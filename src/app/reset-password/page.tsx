'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function ResetPasswordForm() {
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { t } = useLanguage();
  const { toast } = useToast();

  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [resendCooldown]);

  const handleResendOtp = useCallback(async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }
      toast({ title: t('otpSentTitle'), description: data.message });
      setResendCooldown(60);
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsResending(false);
    }
  }, [email, isResending, resendCooldown, toast, t]);

  const handleVerifyOtp = async () => {
    if (!email || otp.length !== 6) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('errorResetPassword'));
      }
      toast({ title: t('otpVerifiedTitle'), description: t('enterNewPasswordPrompt') });
      setStep('reset');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || password.length < 6) return;
    setIsLoading(true);
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || t('errorResetPassword'));
        }
        toast({ title: t('passwordResetSuccessTitle'), description: data.message });
        router.push('/');
    } catch (error: any) {
        toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'verify') {
      handleVerifyOtp();
    } else {
      handleResetPassword();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('resetPasswordTitle')}</CardTitle>
          <CardDescription>
            {step === 'verify' 
              ? t('resetPasswordDescription', { email: email || 'your email' })
              : t('enterNewPasswordPrompt')
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'verify' ? (
              <div className="space-y-2">
                <Label htmlFor="otp">{t('oneTimePassword')}</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="text-center text-lg tracking-[0.5em]"
                  placeholder="------"
                  disabled={isLoading}
                />
                <div className="text-sm text-center text-muted-foreground space-y-1">
                    <p>{t('checkSpam')}</p>
                    <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || isResending}
                    >
                        {isResending 
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('resendingOtp')}</>
                            : resendCooldown > 0 
                            ? t('resendOtpIn', { seconds: resendCooldown }) 
                            : t('resendOtp')
                        }
                    </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="password">{t('newPassword')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">{t('passwordMinLength')}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || (step === 'verify' && otp.length !== 6) || (step === 'reset' && password.length < 6)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === 'verify' ? t('verifyOtp') : t('resetPasswordAndLogin')}
            </Button>
            <Button variant="link" className="w-full" asChild>
                <Link href="/">{t('backToHome')}</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
