import { ChatPanel } from '@/components/chat/chat-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScriptIcon } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Search, Settings, HelpCircle, FileText, Folder, Users, Clock, Moon, Sun, ChevronsUpDown, MoreHorizontal, Plus, Square, MessageSquare } from 'lucide-react';
import { MobileHeader } from '@/components/mobile-header';

const NavItem = ({ icon: Icon, text, active = false, badge }) => (
  <Button variant={active ? "secondary" : "ghost"} className={`w-full justify-start ${active ? '' : 'text-muted-foreground hover:text-foreground'}`}>
    <Icon className="mr-2 h-4 w-4" />
    <span>{text}</span>
    {badge && <Badge variant="secondary" className="ml-auto">{badge}</Badge>}
  </Button>
);

const ProjectItem = ({ title, description, active=false }) => (
    <div className={`p-3 rounded-lg cursor-pointer ${active ? 'bg-primary/5' : 'hover:bg-muted'}`}>
        <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            {!active && <Square size={16} className="text-muted-foreground" />}
            {active && <MessageSquare size={16} className="text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);

const LeftSidebarContent = () => (
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
            <div className="p-2 bg-muted rounded-lg flex">
                <Button variant="ghost" className="w-1/2 flex items-center gap-2 bg-background shadow-sm">
                    <Sun size={16} /> Light
                </Button>
                <Button variant="ghost" className="w-1/2 flex items-center gap-2 text-muted-foreground">
                    <Moon size={16} /> Dark
                </Button>
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
);

const RightSidebarContent = () => (
    <>
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold">Projects (7)</h2>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-4">
          <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              New Project
          </Button>
        </div>
        <div className="flex-1 space-y-2 p-4 overflow-y-auto">
            <ProjectItem title="Learning From 100 Years o..." description="For athletes, high altitude prod..." />
            <ProjectItem title="Research officiants" description="Maxwell's equations—the foun..." />
            <ProjectItem title="What does a senior lead de..." description="Physiological respiration involv..." />
            <ProjectItem title="Write a sweet note to your..." description="In the eighteenth century the G..." />
            <ProjectItem title="Meet with cake bakers" description="Physical space is often conceiv..." active />
            <ProjectItem title="Meet with cake bakers" description="Physical space is often conceiv..." />
        </div>
    </>
);


export default function Home() {
  return (
    <div className="flex h-screen text-foreground font-sans">
      <nav className="w-72 bg-card border-r border-border hidden lg:flex flex-col">
        <LeftSidebarContent />
      </nav>

      <main className="flex-1 flex flex-col bg-muted/30">
        <MobileHeader 
            leftSidebar={<LeftSidebarContent />} 
            rightSidebar={<RightSidebarContent />} 
        />
        <ChatPanel />
      </main>

      <aside className="w-80 bg-card border-l border-border hidden xl:flex flex-col">
        <RightSidebarContent />
      </aside>
    </div>
  );
}
