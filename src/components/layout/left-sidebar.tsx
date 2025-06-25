'use client';

import { useTheme } from "next-themes";
import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BitoIcon } from '@/components/icons';
import { Search, Settings, FileText, Folder, Users, Moon, Sun, MessageSquare, Plus, LogIn, LogOut, Coins, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useProjects } from "@/contexts/ProjectProvider";
import { useLanguage } from "@/contexts/LanguageProvider";
import { useAuth } from "@/contexts/AuthProvider";
import { Skeleton } from "../ui/skeleton";


const NavItem = ({ icon: Icon, text, badge, href }: { icon: React.ElementType, text: string, badge?: string, href: string }) => {
  const pathname = usePathname();
  const active = pathname === href || (href === "/" && pathname.startsWith("/?project=")) || (href.startsWith("/admin") && pathname.startsWith("/admin"));


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

export const LeftSidebarContent = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { createProject } = useProjects();
    const { t } = useLanguage();
    const { user, isLoading, logout, setAuthDialogOpen } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNewProject = () => {
        if (!user) {
            setAuthDialogOpen(true);
        } else {
            createProject();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
                <BitoIcon className="w-8 h-8" />
                <h1 className="text-xl font-bold">Bito</h1>
            </div>
            
            <div className="p-2 space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('search')} className="pl-9" />
                </div>
                 <Button variant="outline" className="w-full justify-start" onClick={handleNewProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('newChat')}
                </Button>
            </div>

            <div className="flex-1 space-y-2 p-2 overflow-y-auto">
                <NavItem icon={MessageSquare} text={t('aiChat')} href="/" />
                {user?.role === 'admin' && (
                  <NavItem icon={Shield} text={t('adminDashboard')} href="/admin" />
                )}
                <NavItem icon={Users} text={t('community')} href="/community" badge={t('live')} />
                <NavItem icon={Folder} text={t('chats')} href="/projects" />
                <NavItem icon={FileText} text={t('templates')} href="/templates" />
            </div>
            
            <div className="space-y-2 p-2 border-t">
                {isLoading ? (
                    <div className="p-2 space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : user ? (
                    <div className="flex items-center justify-between text-sm p-2">
                        <span className="font-medium text-foreground truncate" title={user.username}>{user.username}</span>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 font-semibold text-amber-500" title={`${user.credits} ${t('creditsRemaining')}`}>
                                <Coins className="h-4 w-4" />
                                {user.credits}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
                                <LogOut className="h-4 w-4" />
                                <span className="sr-only">{t('logout')}</span>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-2">
                        <Button variant="outline" className="w-full" onClick={() => setAuthDialogOpen(true)}>
                            <LogIn className="mr-2 h-4 w-4" />
                            {t('loginRegister')}
                        </Button>
                    </div>
                )}

                <NavItem icon={Settings} text={t('settingsAndHelp')} href="/settings" />

                <div className="p-2 bg-muted rounded-lg flex items-center h-[56px]">
                    {mounted && (
                        <>
                            <Button 
                                variant={theme === 'light' ? 'secondary' : 'ghost'} 
                                onClick={() => setTheme('light')}
                                className="w-1/2 flex items-center gap-2"
                            >
                                <Sun size={16} /> {t('light')}
                            </Button>
                            <Button 
                                variant={theme === 'dark' ? 'secondary' : 'ghost'}
                                onClick={() => setTheme('dark')}
                                className="w-1/2 flex items-center gap-2"
                            >
                                <Moon size={16} /> {t('dark')}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
