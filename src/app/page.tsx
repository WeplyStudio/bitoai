import { ChatPanel } from '@/components/chat/chat-panel';
import { MobileHeader } from '@/components/mobile-header';
import { LeftSidebarContent } from '@/components/layout/left-sidebar';
import { RightSidebarContent } from '@/components/layout/right-sidebar';

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
