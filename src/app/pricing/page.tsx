'use client';

import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Mail, MessageCircle, CreditCard, Check } from 'lucide-react';

export default function PricingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('pricingTitle')}</h2>
          <p className="text-muted-foreground mt-2">{t('pricingDescription')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          <Card className="flex flex-col border-2 border-primary shadow-lg max-w-sm mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                <Coins className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{t('oneThousandCredits')}</CardTitle>
              <CardDescription className="text-4xl font-bold text-primary mt-2">
                Rp9.900
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>{t('proAccess')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>{t('lifetimeValidity')}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>{t('prioritySupport')}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled>
                <CreditCard className="mr-2 h-5 w-5" />
                {t('comingSoon')}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{t('howToTopUp')}</CardTitle>
                <CardDescription>
                  {t('howToTopUpDescription')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    <Button asChild className="justify-center w-full">
                        <a href="https://wa.me/6285868055463" target="_blank" rel="noopener noreferrer">
                             <MessageCircle className="mr-2 h-4 w-4" /> {t('whatsapp')}
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
