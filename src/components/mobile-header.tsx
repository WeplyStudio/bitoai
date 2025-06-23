'use client';

import { ScriptIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PanelLeft, PanelRight } from 'lucide-react';

interface MobileHeaderProps {
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export function MobileHeader({ leftSidebar, rightSidebar }: MobileHeaderProps) {
  return (
    <header className="flex lg:hidden items-center justify-between p-2 border-b bg-card">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-card border-r">
          <nav className="flex flex-col h-full overflow-y-auto">
            {leftSidebar}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <ScriptIcon className="w-7 h-7" />
        <h1 className="text-lg font-bold">Script</h1>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <PanelRight className="h-5 w-5" />
            <span className="sr-only">Open Projects</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0 bg-card border-l">
          <aside className="flex flex-col h-full overflow-y-auto">
            {rightSidebar}
          </aside>
        </SheetContent>
      </Sheet>
    </header>
  );
}
