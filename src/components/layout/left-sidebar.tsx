'use client';

import { useTheme } from "next-themes";
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScriptIcon } from '@/components/icons';
import { Search, Settings, HelpCircle, FileText, Folder, Users, Clock, Moon, Sun, ChevronsUpDown, MessageSquare } from 'lucide-react';

const NavItem = ({ icon: Icon, text, active = false, badge }: { icon: React.ElementType, text: string, active?: boolean, badge?: string }) => (
  <Button variant={active ? "secondary" : "ghost"} className={`w-full justify-start ${active ? '' : 'text-muted-foreground hover:text-foreground'}`}>
    <Icon className="mr-2 h-4 w-4" />
    <span>{text}</span>
    {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
  </Button>
);

export const LeftSidebarContent = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <ScriptIcon className="w-8 h-8" />
                <h1 className="text-xl font-bold">Script</h1>
            </div>
            
            <div className="p-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-9" />
                </div>
            </div>

            <div className="flex-1 space-y-2 p-2 overflow-y-auto">
                <NavItem icon={MessageSquare} text="AI Chat" active />
                <NavItem icon={Folder} text="Projects" />
                <NavItem icon={FileText} text="Templates" />
                <NavItem icon={Users} text="Community" badge="NEW" />
                <NavItem icon={Clock} text="History" />
            </div>
            
            <div className="space-y-2 p-2 border-t">
                <NavItem icon={Settings} text="Settings & Help" />
                <NavItem icon={HelpCircle} text="Help" />
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
                <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Emilia Caitlin" data-ai-hint="woman portrait" />
                        <AvatarFallback>EC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Emilia Caitlin</p>
                        <p className="text-xs text-muted-foreground">hey@unspace.agency</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </>
    )
};
