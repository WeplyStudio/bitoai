'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/contexts/ProjectProvider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Code, FileText, Lightbulb, Mail, MessageSquare, Bot, Plus, Edit, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';

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

const TemplateCard = ({ template, onSelect, onEdit, onDelete }: { template: Template, onSelect: (prompt: string) => void, onEdit?: (template: Template) => void, onDelete?: (templateId: string) => void }) => {
    const Icon = template.icon || Lightbulb;
    const { t } = useLanguage();
    return (
        <div className="p-4 border rounded-lg flex flex-col items-start gap-3 text-left h-full bg-card hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
            <div className="p-2 rounded-full bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 w-full">
                <h3 className="font-semibold">{template.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">{template.description}</p>
            </div>
            <div className="flex w-full justify-between items-center pt-2 border-t border-transparent">
              <Button variant="ghost" size="sm" onClick={() => onSelect(template.prompt)}>{t('useTemplate')}</Button>
              {template.isCustom && onEdit && onDelete && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('deletePromptConfirmation', { title: template.title })}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => onDelete(template.id)}>{t('delete')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
        </div>
    )
}

export default function TemplatesPage() {
    const router = useRouter();
    const { createProject, activeProjectId } = useProjects();
    const { toast } = useToast();
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

    const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', prompt: '' });
    
    useEffect(() => {
        try {
            const savedTemplates = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
            if (savedTemplates) {
                setCustomTemplates(JSON.parse(savedTemplates));
            }
        } catch (error) {
            console.error("Failed to load custom templates from localStorage", error);
            toast({ variant: "destructive", title: t('error'), description: t('errorLoadCustomPrompts') });
        }
        setIsMounted(true);
    }, [toast, t]);

    useEffect(() => {
        if(isMounted) {
            try {
                localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
            } catch (error) {
                console.error("Failed to save custom templates to localStorage", error);
            }
        }
    }, [customTemplates, isMounted]);

    const handleSelectTemplate = (prompt: string) => {
        if (!activeProjectId) {
            createProject();
        }
        localStorage.setItem('bito-ai-template-prompt', prompt);
        router.push('/');
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleOpenDialog = (template: Template | null = null) => {
      setEditingTemplate(template);
      if (template) {
        setFormData({ title: template.title, description: template.description, prompt: template.prompt });
      } else {
        setFormData({ title: '', description: '', prompt: '' });
      }
      setDialogOpen(true);
    }
    
    const handleSaveTemplate = () => {
        if (!formData.title.trim() || !formData.prompt.trim()) {
            toast({ variant: 'destructive', title: t('error'), description: t('errorPromptTitleRequired') });
            return;
        }

        if (editingTemplate) {
            // Update existing template
            const updatedTemplates = customTemplates.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t);
            setCustomTemplates(updatedTemplates);
            toast({ title: t('promptUpdated'), description: t('promptUpdatedDescription', { title: formData.title }) });
        } else {
            // Create new template
            const newTemplate: Template = {
                id: `custom-${Date.now()}`,
                title: formData.title,
                description: formData.description,
                prompt: formData.prompt,
                isCustom: true,
            };
            setCustomTemplates(prev => [...prev, newTemplate]);
            toast({ title: t('promptCreated'), description: t('promptCreatedDescription', { title: formData.title }) });
        }
        setDialogOpen(false);
    }

    const handleDeleteTemplate = (id: string) => {
        setCustomTemplates(prev => prev.filter(t => t.id !== id));
        toast({ variant: 'destructive', title: t('promptDeleted'), description: t('promptDeletedDescription') });
    }

    if (!isMounted) return null;

    return (
        <div className="p-4 md:p-8">
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? t('editPrompt') : t('createNewPrompt')}</DialogTitle>
                        <DialogDescription>
                          {editingTemplate ? t('dialogEditPromptDescription') : t('dialogCreatePromptDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('promptTitleLabel')}</Label>
                            <Input id="title" value={formData.title} onChange={handleFormChange} placeholder={t('promptTitlePlaceholder')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">{t('promptDescriptionLabel')}</Label>
                            <Input id="description" value={formData.description} onChange={handleFormChange} placeholder={t('promptDescriptionPlaceholder')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prompt">{t('promptLabel')}</Label>
                            <Textarea id="prompt" value={formData.prompt} onChange={handleFormChange} placeholder={t('promptPlaceholder')} rows={5} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="ghost">{t('cancel')}</Button>
                        </DialogClose>
                        <Button onClick={handleSaveTemplate}>{t('savePrompt')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{t('templatesTitle')}</h2>
                        <p className="text-muted-foreground">{t('templatesDescription')}</p>
                    </div>
                </div>
                
                <Tabs defaultValue={PRESET_TEMPLATES_KEY} className="w-full">
                    <TabsList>
                        <TabsTrigger value={PRESET_TEMPLATES_KEY}>{t('preset')}</TabsTrigger>
                        <TabsTrigger value={CUSTOM_TEMPLATES_KEY}>{t('myPrompts')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value={PRESET_TEMPLATES_KEY} className="mt-6">
                        {Object.entries(presetTemplates).map(([category, templateList]) => (
                            <div key={category} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4">{category}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {templateList.map((template, index) => (
                                        <TemplateCard key={index} template={{...template, id: `preset-${category}-${index}`}} onSelect={handleSelectTemplate} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </TabsContent>
                     <TabsContent value={CUSTOM_TEMPLATES_KEY} className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold">{t('yourCustomPrompts')}</h3>
                             <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" /> {t('createNewPrompt')}
                            </Button>
                        </div>
                        {customTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {customTemplates.map((template) => (
                                    <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} onEdit={() => handleOpenDialog(template)} onDelete={handleDeleteTemplate} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <h3 className="text-xl font-semibold">{t('noCustomPrompts')}</h3>
                                <p className="text-muted-foreground mt-2 mb-4">{t('noCustomPromptsDescription')}</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
