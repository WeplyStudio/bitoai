'use client';

import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, MessageSquare } from 'lucide-react';
import { useProjects, type Project } from '@/contexts/ProjectProvider';
import { formatDistanceToNow } from 'date-fns';

const ProjectItem = ({ project, active=false, onSwitch }: { project: Project, active?: boolean, onSwitch: (id: string) => void }) => (
    <button 
      className={`w-full text-left p-3 rounded-lg cursor-pointer ${active ? 'bg-primary/10' : 'hover:bg-muted'}`}
      onClick={() => onSwitch(project.id)}
    >
        <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold text-sm mr-2 break-words">{project.name}</h4>
            <MessageSquare size={16} className={active ? "text-primary flex-shrink-0 mt-0.5" : "text-muted-foreground flex-shrink-0 mt-0.5"} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{project.summary}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</p>
    </button>
);

export const RightSidebarContent = () => {
  const { projects, activeProjectId, createProject, switchProject } = useProjects();
  
  return (
    <>
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-semibold">Projects ({projects.length})</h2>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-4">
          <Button variant="outline" className="w-full justify-start" onClick={() => createProject()}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
          </Button>
        </div>
        <div className="flex-1 space-y-2 p-4 overflow-y-auto">
            {projects.sort((a, b) => b.createdAt - a.createdAt).map(project => (
                <ProjectItem 
                    key={project.id}
                    project={project}
                    active={project.id === activeProjectId}
                    onSwitch={switchProject}
                />
            ))}
        </div>
    </>
);
};
