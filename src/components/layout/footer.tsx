'use client';

import Link from 'next/link';
import { BitoIcon } from '@/components/icons';
import { useLanguage } from '@/contexts/LanguageProvider';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center flex-col sm:flex-row gap-8">
          <div className="flex items-center gap-2">
            <BitoIcon className="h-7 w-7" />
            <span className="font-bold text-lg">Bito AI</span>
          </div>
          <div className="flex gap-6 items-center text-sm flex-wrap justify-center">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('topUp')}
            </Link>
            <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('settingsAndHelp')}
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} JDev. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
