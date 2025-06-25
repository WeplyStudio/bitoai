import { LeftSidebarContent } from '@/components/layout/left-sidebar';
import { RightSidebarContent } from '@/components/layout/right-sidebar';
import { MobileHeader } from '@/components/mobile-header';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
      </main>

      <aside className="w-80 bg-card border-l border-border hidden xl:flex flex-col">
        <RightSidebarContent />
      </aside>
    </div>
  );
}
