'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, Lightbulb, Mail, MessageSquare, Bot } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectProvider';

const templates = {
  "General": [
    {
      icon: Lightbulb,
      title: "Brainstorm ideas",
      description: "Generate a list of ideas for any topic.",
      prompt: "Brainstorm 10 unique ideas for [your topic here]. For each idea, provide a brief description."
    },
    {
      icon: MessageSquare,
      title: "Summarize text",
      description: "Get a concise summary of a long piece of text.",
      prompt: "Summarize the following text into 3 key bullet points:\n\n[paste text here]"
    },
     {
      icon: Bot,
      title: "Act as a character",
      description: "Have a conversation with an AI acting as a specific character.",
      prompt: "I want you to act as a [character name], for example, a pirate. I want you to respond and answer like a pirate using pirate-like vocabulary and tone. My first sentence is: 'Hello!'"
    },
  ],
  "Marketing": [
    {
      icon: FileText,
      title: "Write a blog post",
      description: "Create a draft for a blog post on a given topic.",
      prompt: "Write a 500-word blog post about the benefits of [topic], targeting an audience of [target audience]."
    },
    {
      icon: Mail,
      title: "Craft a marketing email",
      description: "Generate a compelling email to promote a product or service.",
      prompt: "Write a marketing email to announce the launch of our new product, [product name]. The target audience is [audience], and the key benefits are [benefit 1], [benefit 2], and [benefit 3]."
    },
  ],
  "Email": [
    {
      icon: Mail,
      title: "Write a professional email",
      description: "Compose a formal email for business communication.",
      prompt: "Write a professional email to [recipient name] regarding [subject]. I need to convey the following points:\n1. [Point 1]\n2. [Point 2]\n3. [Point 3]"
    },
    {
      icon: Mail,
      title: "Follow-up email",
      description: "Draft a polite follow-up email after a meeting or interview.",
      prompt: "Write a follow-up email after a meeting with [person's name] on [date] to discuss [topic]. I want to thank them for their time and reiterate my interest."
    }
  ],
  "Code": [
    {
      icon: Code,
      title: "Explain a code snippet",
      description: "Get a detailed explanation of a piece of code.",
      prompt: "Explain the following code snippet and what it does:\n\n```[language]\n[paste code here]\n```"
    },
    {
      icon: Code,
      title: "Write a function",
      description: "Generate a function in any programming language.",
      prompt: "Write a function in [programming language] that takes [input] and returns [output]."
    }
  ]
};

const TemplateCard = ({ template, onSelect }: { template: any, onSelect: (prompt: string) => void }) => {
    const Icon = template.icon;
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

export default function TemplatesPage() {
    const router = useRouter();
    const { createProject, activeProjectId } = useProjects();

    const handleSelectTemplate = (prompt: string) => {
        if (!activeProjectId) {
            createProject();
        }
        localStorage.setItem('bito-ai-template-prompt', prompt);
        router.push('/');
    };

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Prompt Templates</h2>
                        <p className="text-muted-foreground">Browse our collection of expertly crafted prompts to kickstart your conversations.</p>
                    </div>
                </div>
                
                <div className="h-[calc(100vh-200px)]">
                    <Tabs defaultValue="General" className="h-full flex flex-col">
                        <TabsList className="shrink-0">
                            {Object.keys(templates).map((category) => (
                                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                            ))}
                        </TabsList>
                        <ScrollArea className="flex-1 mt-4">
                            {Object.entries(templates).map(([category, templateList]) => (
                                <TabsContent key={category} value={category} className="mt-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {templateList.map((template, index) => (
                                            <TemplateCard key={index} template={template} onSelect={handleSelectTemplate} />
                                        ))}
                                    </div>
                                </TabsContent>
                            ))}
                        </ScrollArea>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
