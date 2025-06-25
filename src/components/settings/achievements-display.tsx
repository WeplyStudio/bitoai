
'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// Custom SVG Icons for Achievements
const FirstChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
);
const ThreeStreakIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2l-2.8 5.8L3 9l4.5 4.1L6.2 20 12 16.8 17.8 20l-1.3-6.9L21 9l-6.2-1.2L12 2z"/></svg>
);
const TenChatsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
);
const HundredChatsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
);
const ThousandChatsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
);
const TenThousandChatsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-1h14v1z"/></svg>
);
const HundredThousandChatsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.8,3H5.2L2,8v11c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8L18.8,3z M12,15.1l-3.5-3.5l1.4-1.4l2.1,2.1l4.6-4.6l1.4,1.4L12,15.1z M10,5h4v1h-4V5z"/></svg>
);
const FirstProChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5S14.76 2 12 2zm-3.5 7c-1.93 0-3.5-1.57-3.5-3.5S3.07 2 5 2s3.5 1.57 3.5 3.5S6.93 9 5 9zm7-7c-1.93 0-3.5 1.57-3.5 3.5S9.57 9 11.5 9s3.5-1.57 3.5-3.5S13.43 2 11.5 2zm3.5 7c-1.93 0-3.5-1.57-3.5-3.5S13.07 2 15 2s3.5 1.57 3.5 3.5S16.93 9 15 9zm-7 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
);
const RichPeopleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 1.9l-7.53 10.6L12 22.1l7.53-9.6L12 1.9zm0 2.73L16.47 9H7.53L12 4.63z"/></svg>
);
const ImportantPeopleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
);
const NightOwlIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.34 2.02c-5.69 0-10.32 4.63-10.32 10.32s4.63 10.32 10.32 10.32c3.94 0 7.4-2.23 9.19-5.59-4.83.5-8.8-3.47-8.3-8.3C12.92 6.84 12.63 2.02 12.34 2.02z"/></svg>
);
const QuickThinkerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
);
const MemelordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><circle cx="12" cy="12" r="10"/><path fill="#fff" d="M15.5 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/><path fill="#fff" d="M7.71 14.24a5.07 5.07 0 0 0 8.58 0 .5.5 0 0 0-.8-.6C14.1 14.88 13.1 15.5 12 15.5s-2.1-.62-3.49-1.86a.5.5 0 1 0-.8.6z"/></svg>
);
const PromptCrafterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-8v-2h8v2zm0-4h-8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
);
const DarkHunterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
);


const achievementMap = {
  first_chat: { icon: FirstChatIcon, titleKey: 'achFirstChatTitle', descriptionKey: 'achFirstChatDesc' },
  three_streak: { icon: ThreeStreakIcon, titleKey: 'achThreeStreakTitle', descriptionKey: 'achThreeStreakDesc' },
  ten_chats: { icon: TenChatsIcon, titleKey: 'achTenChatsTitle', descriptionKey: 'achTenChatsDesc' },
  hundred_chats: { icon: HundredChatsIcon, titleKey: 'achHundredChatsTitle', descriptionKey: 'achHundredChatsDesc' },
  thousand_chats: { icon: ThousandChatsIcon, titleKey: 'achThousandChatsTitle', descriptionKey: 'achThousandChatsDesc' },
  ten_thousand_chats: { icon: TenThousandChatsIcon, titleKey: 'achTenThousandChatsTitle', descriptionKey: 'achTenThousandChatsDesc' },
  hundred_thousand_chats: { icon: HundredThousandChatsIcon, titleKey: 'achHundredThousandChatsTitle', descriptionKey: 'achHundredThousandChatsDesc' },
  
  first_pro_chat: { icon: FirstProChatIcon, titleKey: 'achFirstProChatTitle', descriptionKey: 'achFirstProChatDesc' },
  rich_people: { icon: RichPeopleIcon, titleKey: 'achRichPeopleTitle', descriptionKey: 'achRichPeopleDesc' },
  
  important_people: { icon: ImportantPeopleIcon, titleKey: 'achImportantPeopleTitle', descriptionKey: 'achImportantPeopleDesc' },
  night_owl: { icon: NightOwlIcon, titleKey: 'achNightOwlTitle', descriptionKey: 'achNightOwlDesc' },
  
  quick_thinker: { icon: QuickThinkerIcon, titleKey: 'achQuickThinkerTitle', descriptionKey: 'achQuickThinkerDesc' },
  prompt_crafter: { icon: PromptCrafterIcon, titleKey: 'achPromptCrafterTitle', descriptionKey: 'achPromptCrafterDesc' },
  memelord: { icon: MemelordIcon, titleKey: 'achMemelordTitle', descriptionKey: 'achMemelordDesc' },
  dark_hunter: { icon: DarkHunterIcon, titleKey: 'achDarkHunterTitle', descriptionKey: 'achDarkHunterDesc' },
};

const allAchievementKeys = Object.keys(achievementMap);
type AchievementKey = keyof typeof achievementMap;

export function AchievementsDisplay() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const unlockedAchievements = user?.achievements || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('achievementsTitle')}</CardTitle>
        <CardDescription>{t('achievementsDescription', { count: unlockedAchievements.length, total: allAchievementKeys.length })}</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
            {allAchievementKeys.map((key) => {
              const achievement = achievementMap[key as AchievementKey];
              const isUnlocked = unlockedAchievements.includes(key);
              const Icon = isUnlocked ? achievement.icon : Lock;

              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 aspect-square p-2 border rounded-lg transition-all',
                        isUnlocked
                          ? 'bg-amber-100/50 dark:bg-amber-900/30 border-amber-400/50 shadow-sm'
                          : 'bg-muted/50 border-dashed opacity-60'
                      )}
                    >
                      <Icon className={cn('h-8 w-8', isUnlocked ? 'text-amber-500' : 'text-muted-foreground')} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{t(achievement.titleKey as any)}</p>
                    <p className="text-sm text-muted-foreground">{isUnlocked ? t(achievement.descriptionKey as any) : t('achievementLocked')}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
