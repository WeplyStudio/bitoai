'use client';

import { useTheme } from "next-themes";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BitoIcon } from '@/components/icons';
import { Search, Settings, FileText, Folder, Users, Moon, Sun, MessageSquare, Plus } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useProjects } from "@/contexts/ProjectProvider";

const NavItem = ({ icon: Icon, text, badge, href }: { icon: React.ElementType, text: string, badge?: string, href: string }) => {
  const pathname = usePathname();
  const active = pathname === href || (href === "/" && pathname.startsWith("/?project="));


  return (
    <Link href={href} passHref>
      <Button variant={active ? "secondary" : "ghost"} className={cn("w-full justify-start", !active && "text-muted-foreground hover:text-foreground")}>
        <Icon className="mr-2 h-4 w-4" />
        <span>{text}</span>
        {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
      </Button>
    </Link>
  );
};

const NavButton = ({ icon: Icon, text, badge, onClick }: { icon: React.ElementType, text: string, badge?: string, onClick?: () => void }) => (
    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={onClick}>
      <Icon className="mr-2 h-4 w-4" />
      <span>{text}</span>
      {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
    </Button>
  );

export const LeftSidebarContent = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { createProject } = useProjects();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNewProject = () => {
        createProject();
    };

    const handleOpenTemplates = () => {
        window.dispatchEvent(new Event('openTemplates'));
    };

    return (
        <>
            <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                <BitoIcon className="w-8 h-8" />
                <h1 className="text-xl font-bold">Bito</h1>
            </div>
            
            <div className="p-2 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-9" />
                </div>
                 <Button variant="outline" className="w-full justify-start" onClick={handleNewProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                </Button>
            </div>

            <div className="flex-1 space-y-2 p-2 overflow-y-auto">
                <NavItem icon={MessageSquare} text="AI Chat" href="/" />
                <NavItem icon={Users} text="Community" href="/community" badge="LIVE" />
                <NavItem icon={Folder} text="Chats" href="/projects" />
                <NavButton icon={FileText} text="Templates" onClick={handleOpenTemplates} />
            </div>
            
            <div className="space-y-2 p-2 border-t">
                <NavItem icon={Settings} text="Settings &amp; Help" href="/settings" />
                <div className="p-2 bg-muted rounded-lg flex items-center h-[56px]">
                    {mounted && (
                        <>
                            <Button 
                                variant={theme === 'light' ? 'secondary' : 'ghost'} 
                                onClick={() => setTheme('light')}
                                className="w-1/2 flex items-center gap-2"
                            >
                                <Sun size={16} /> Light
                            </Button>
                            <Button 
                                variant={theme === 'dark' ? 'secondary' : 'ghost'}
                                onClick={() => setTheme('dark')}
                                className="w-1/2 flex items-center gap-2"
                            >
                                <Moon size={16} /> Dark
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </>
    )
};
