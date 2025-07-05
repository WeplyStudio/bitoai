'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useToast } from '@/hooks/use-toast';

function OtpForm() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { verifyOtp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    
    setIsLoading(true);
    await verifyOtp(email, otp);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('emailVerificationTitle')}</CardTitle>
          <CardDescription>
            {t('emailVerificationDescription', { email: email || 'your email' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              />
            </div>
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
            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('verifyAndContinue')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OtpForm />
        </Suspense>
    )
}
