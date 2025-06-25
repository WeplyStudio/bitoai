
'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    MessageSquarePlus, Milestone, Sparkles, Lock, Inbox, Archive, Crown, Trophy,
    Award, Moon, Zap, SmilePlus, ScrollText, Gem, Star, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const achievementMap = {
  first_chat: { icon: MessageSquarePlus, titleKey: 'achFirstChatTitle', descriptionKey: 'achFirstChatDesc' },
  three_streak: { icon: Award, titleKey: 'achThreeStreakTitle', descriptionKey: 'achThreeStreakDesc' },
  ten_chats: { icon: Milestone, titleKey: 'achTenChatsTitle', descriptionKey: 'achTenChatsDesc' },
  hundred_chats: { icon: Inbox, titleKey: 'achHundredChatsTitle', descriptionKey: 'achHundredChatsDesc' },
  thousand_chats: { icon: Archive, titleKey: 'achThousandChatsTitle', descriptionKey: 'achThousandChatsDesc' },
  ten_thousand_chats: { icon: Crown, titleKey: 'achTenThousandChatsTitle', descriptionKey: 'achTenThousandChatsDesc' },
  hundred_thousand_chats: { icon: Trophy, titleKey: 'achHundredThousandChatsTitle', descriptionKey: 'achHundredThousandChatsDesc' },
  
  first_pro_chat: { icon: Sparkles, titleKey: 'achFirstProChatTitle', descriptionKey: 'achFirstProChatDesc' },
  rich_people: { icon: Gem, titleKey: 'achRichPeopleTitle', descriptionKey: 'achRichPeopleDesc' },
  
  important_people: { icon: Star, titleKey: 'achImportantPeopleTitle', descriptionKey: 'achImportantPeopleDesc' },
  night_owl: { icon: Moon, titleKey: 'achNightOwlTitle', descriptionKey: 'achNightOwlDesc' },
  
  quick_thinker: { icon: Zap, titleKey: 'achQuickThinkerTitle', descriptionKey: 'achQuickThinkerDesc' },
  prompt_crafter: { icon: ScrollText, titleKey: 'achPromptCrafterTitle', descriptionKey: 'achPromptCrafterDesc' },
  memelord: { icon: SmilePlus, titleKey: 'achMemelordTitle', descriptionKey: 'achMemelordDesc' },
  dark_hunter: { icon: Shield, titleKey: 'achDarkHunterTitle', descriptionKey: 'achDarkHunterDesc' },
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
