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

const presetTemplates: Record<string, Omit<Template, 'id' | 'isCustom'>[]> = {
  "General": [
    { icon: Lightbulb, title: "Brainstorm ideas", description: "Generate a list of ideas for any topic.", prompt: "Brainstorm 10 unique ideas for [your topic here]. For each idea, provide a brief description." },
    { icon: MessageSquare, title: "Summarize text", description: "Get a concise summary of a long piece of text.", prompt: "Summarize the following text into 3 key bullet points:\n\n[paste text here]" },
    { icon: Bot, title: "Act as a character", description: "Have a conversation with an AI acting as a specific character.", prompt: "I want you to act as a [character name], for example, a pirate. I want you to respond and answer like a pirate using pirate-like vocabulary and tone. My first sentence is: 'Hello!'" },
  ],
  "Marketing": [
    { icon: FileText, title: "Write a blog post", description: "Create a draft for a blog post on a given topic.", prompt: "Write a 500-word blog post about the benefits of [topic], targeting an audience of [target audience]." },
    { icon: Mail, title: "Craft a marketing email", description: "Generate a compelling email to promote a product or service.", prompt: "Write a marketing email to announce the launch of our new product, [product name]. The target audience is [audience], and the key benefits are [benefit 1], [benefit 2], and [benefit 3]." },
  ],
  "Email": [
    { icon: Mail, title: "Write a professional email", description: "Compose a formal email for business communication.", prompt: "Write a professional email to [recipient name] regarding [subject]. I need to convey the following points:\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]" },
    { icon: Mail, title: "Follow-up email", description: "Draft a polite follow-up email after a meeting or interview.", prompt: "Write a follow-up email after a meeting with [person's name] on [date] to discuss [topic]. I want to thank them for their time and reiterate my interest." }
  ],
  "Code": [
    { icon: Code, title: "Explain a code snippet", description: "Get a detailed explanation of a piece of code.", prompt: "Explain the following code snippet and what it does:\n\n```[language]\n[paste code here]\n```" },
    { icon: Code, title: "Write a function", description: "Generate a function in any programming language.", prompt: "Write a function in [programming language] that takes [input] and returns [output]." }
  ]
};

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
