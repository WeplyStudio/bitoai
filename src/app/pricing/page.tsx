'use client';

import { useLanguage } from '@/contexts/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const { t } = useLanguage();

  const tiers = [
    {
      name: t('pricingTierStarterTitle'),
      price: t('pricingTierFree'),
      description: t('pricingTierStarterDescription'),
      features: [
        t('pricingTierStarterFeature1'),
        t('pricingTierStarterFeature2'),
        t('pricingTierStarterFeature3'),
        t('pricingTierStarterFeature4'),
      ],
      cta: t('pricingTierStarterCTA'),
      isHighlighted: false,
    },
    {
      name: t('pricingTierProTitle'),
      price: t('pricingTierProPrice'),
      description: t('pricingTierProDescription'),
      features: [
        t('pricingTierProFeature1'),
        t('pricingTierProFeature2'),
        t('pricingTierProFeature3'),
        t('pricingTierProFeature4'),
      ],
      cta: t('pricingTierProCTA'),
      isHighlighted: true,
    },
    {
      name: t('pricingTierEnterpriseTitle'),
      price: t('pricingTierEnterprisePrice'),
      description: t('pricingTierEnterpriseDescription'),
      features: [
        t('pricingTierEnterpriseFeature1'),
        t('pricingTierEnterpriseFeature2'),
        t('pricingTierEnterpriseFeature3'),
        t('pricingTierEnterpriseFeature4'),
      ],
      cta: t('pricingTierEnterpriseCTA'),
      isHighlighted: false,
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t('pricingTitle')}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t('pricingDescription')}</p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                'flex flex-col h-full shadow-lg transition-transform duration-300 hover:scale-105',
                tier.isHighlighted && 'border-2 border-primary relative'
              )}
            >
              {tier.isHighlighted && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    <Star className="h-4 w-4" />
                    {t('pricingMostPopular')}
                  </div>
                </div>
              )}
              <CardHeader className="pt-12">
                <CardTitle className="text-2xl font-semibold">{tier.name}</CardTitle>
                <CardDescription className="text-4xl font-bold text-foreground pt-2">
                  {tier.price}
                </CardDescription>
                <p className="text-muted-foreground pt-2 min-h-[40px]">{tier.description}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" size="lg" variant={tier.isHighlighted ? 'default' : 'outline'}>
                    <a href="https://wa.me/6285868055463" target="_blank" rel="noopener noreferrer">
                      {tier.cta}
                    </a>
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* How to Top Up */}
         <Card className="max-w-3xl mx-auto bg-card">
            <CardHeader className="text-center">
                <Sparkles className="mx-auto h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl">{t('howToTopUp')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">{t('howToTopUpDescription')}</p>

                <Button asChild size="lg">
                    <a href="https://wa.me/6285868055463" target="_blank" rel="noopener noreferrer">
                        {t('contactAdmin')}
                    </a>
                </Button>
            </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{t('faq')}</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">{t('pricingFaq1Title')}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{t('pricingFaq1Content')}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">{t('pricingFaq2Title')}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{t('pricingFaq2Content')}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">{t('pricingFaq3Title')}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{t('pricingFaq3Content')}</AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg">{t('pricingFaq4Title')}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{t('pricingFaq4Content')}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
