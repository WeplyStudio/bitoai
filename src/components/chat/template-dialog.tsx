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

const TemplateCard = ({ template, onSelect }: { template: Template, onSelect: (prompt: string) => void }) => {
    const Icon = template.icon || Lightbulb;
    return (
        <div className="p-4 border rounded-lg flex flex-col items-start gap-3 text-left h-full bg-card hover:border-primary/50 transition-colors">
            <div className="p-2 rounded-full bg-primary/5">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
                <h3 className="font-semibold">{template.title}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelect(template.prompt)}>Use Template</Button>
        </div>
    )
}

export function TemplateDialog({ isOpen, onOpenChange, onSelectTemplate }: TemplateDialogProps) {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [isMounted, setIsMounted] = useState(false);

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
          <DialogTitle>Prompt Templates</DialogTitle>
          <DialogDescription>
            Get started with these expertly crafted prompts. Click "Use Template" to add it to your chat input.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[500px]">
            <Tabs defaultValue={PRESET_TEMPLATES_KEY} className="h-full flex flex-col">
                <TabsList className="shrink-0">
                    <TabsTrigger value={PRESET_TEMPLATES_KEY}>Preset</TabsTrigger>
                    <TabsTrigger value={CUSTOM_TEMPLATES_KEY}>My Prompts</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 mt-4">
                    <TabsContent value={PRESET_TEMPLATES_KEY} className="mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(presetTemplates).flatMap(([category, templateList]) => 
                                templateList.map((template, index) => (
                                    <TemplateCard key={`preset-${index}`} template={{...template, id: `preset-${category}-${index}`}} onSelect={onSelectTemplate} />
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
                            <p className="text-muted-foreground">You haven't created any custom prompts yet.</p>
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
