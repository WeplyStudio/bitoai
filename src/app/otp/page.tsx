'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

function OtpForm() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { verifyOtp } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (!email) {
      router.push('/'); // Redirect if email is not in query params
    }
  }, [email, router]);

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
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
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
            <p className="text-sm text-center text-muted-foreground">
              Didn't receive the code? Please check your spam folder.
            </p>
            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and Continue
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
