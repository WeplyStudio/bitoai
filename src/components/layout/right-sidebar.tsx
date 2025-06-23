'use client';

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, Square, MessageSquare } from 'lucide-react';

const ProjectItem = ({ title, description, active=false }: { title: string, description: string, active?: boolean }) => (
    <div className={`p-3 rounded-lg cursor-pointer ${active ? 'bg-primary/5' : 'hover:bg-muted'}`}>
        <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            {!active && <Square size={16} className="text-muted-foreground" />}
            {active && <MessageSquare size={16} className="text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);

export const RightSidebarContent = () => (
    <>
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold">Projects (6)</h2>
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
        </div>
    </>
);
