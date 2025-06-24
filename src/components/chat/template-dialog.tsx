'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, Lightbulb, Mail, MessageSquare, Bot } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

interface TemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (prompt: string) => void;
}

const PRESET_TEMPLATES_KEY = 'preset';
const CUSTOM_TEMPLATES_KEY = 'bito-ai-custom-templates';

interface Template {
  id: string;
  icon?: React.ElementType;
  title: string;
  description: string;
  prompt: string;
  isCustom?: boolean;
}

const TemplateCard = ({ template, onSelect }: { template: Template, onSelect: (prompt: string) => void }) => {
    const Icon = template.icon || Lightbulb;
    const { t } = useLanguage();
    return (
        <div className="p-4 border rounded-lg flex flex-col items-start gap-3 text-left h-full bg-card hover:border-primary/50 transition-colors">
            <div className="p-2 rounded-full bg-primary/5">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelect(template.prompt)}>{t('useTemplate')}</Button>
        </div>
    )
}

export function TemplateDialog({ isOpen, onOpenChange, onSelectTemplate }: TemplateDialogProps) {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useLanguage();

  const presetTemplates: Record<string, Omit<Template, 'id' | 'isCustom'>[]> = {
    [t('templateCategoryGeneral')]: [
      { icon: Lightbulb, title: t('templateGeneralTitle1'), description: t('templateGeneralDescription1'), prompt: t('templateGeneralPrompt1') },
      { icon: MessageSquare, title: t('templateGeneralTitle2'), description: t('templateGeneralDescription2'), prompt: t('templateGeneralPrompt2') },
      { icon: Bot, title: t('templateGeneralTitle3'), description: t('templateGeneralDescription3'), prompt: t('templateGeneralPrompt3') },
    ],
    [t('templateCategoryMarketing')]: [
      { icon: FileText, title: t('templateMarketingTitle1'), description: t('templateMarketingDescription1'), prompt: t('templateMarketingPrompt1') },
      { icon: Mail, title: t('templateMarketingTitle2'), description: t('templateMarketingDescription2'), prompt: t('templateMarketingPrompt2') },
    ],
    [t('templateCategoryEmail')]: [
      { icon: Mail, title: t('templateEmailTitle1'), description: t('templateEmailDescription1'), prompt: t('templateEmailPrompt1') },
      { icon: Mail, title: t('templateEmailTitle2'), description: t('templateEmailDescription2'), prompt: t('templateEmailPrompt2') }
    ],
    [t('templateCategoryCode')]: [
      { icon: Code, title: t('templateCodeTitle1'), description: t('templateCodeDescription1'), prompt: t('templateCodePrompt1') },
      { icon: Code, title: t('templateCodeTitle2'), description: t('templateCodeDescription2'), prompt: t('templateCodePrompt2') }
    ]
  };

  useEffect(() => {
    // Load custom templates from localStorage only on the client side
    if (isOpen) {
        try {
            const savedTemplates = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
            if (savedTemplates) {
                setCustomTemplates(JSON.parse(savedTemplates));
            }
        } catch (error) {
            console.error("Failed to load custom templates from localStorage for dialog", error);
        }
    }
    setIsMounted(true);
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('dialogTemplatesTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogTemplatesDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[500px]">
            <Tabs defaultValue={PRESET_TEMPLATES_KEY} className="h-full flex flex-col">
                <TabsList className="shrink-0">
                    <TabsTrigger value={PRESET_TEMPLATES_KEY}>{t('preset')}</TabsTrigger>
                    <TabsTrigger value={CUSTOM_TEMPLATES_KEY}>{t('myPrompts')}</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 mt-4">
                    <TabsContent value={PRESET_TEMPLATES_KEY} className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(presetTemplates).flatMap(([category, templateList]) => 
                                templateList.map((template, index) => (
                                    <TemplateCard key={`preset-${category}-${index}`} template={{...template, id: `preset-${category}-${index}`}} onSelect={onSelectTemplate} />
                                ))
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value={CUSTOM_TEMPLATES_KEY} className="mt-0">
                      {customTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {customTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
                          ))}
                        </div>
                      ) : (
                         <div className="text-center py-12">
                            <p className="text-muted-foreground">{t('dialogTemplatesNoCustomPrompts')}</p>
                         </div>
                      )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
