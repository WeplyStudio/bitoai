
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';

export interface Project {
  _id: string;
  id: string; // Add id for client-side compatibility
  name: string;
  summary: string;
  createdAt: number;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | undefined;
  isLoading: boolean;
  createProject: () => Promise<void>;
  switchProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    if (!user) {
        setProjects([]);
        setActiveProjectId(null);
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      const clientProjects = data.map((p: any) => ({ ...p, id: p._id }));
      setProjects(clientProjects);
      
      const savedActiveId = localStorage.getItem('bito-ai-active-project-id');
      if (savedActiveId && clientProjects.some((p: Project) => p.id === savedActiveId)) {
          setActiveProjectId(savedActiveId);
      } else if (clientProjects.length > 0) {
          setActiveProjectId(clientProjects[0].id);
      } else {
          setActiveProjectId(null);
      }

    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your projects.' });
      setProjects([]);
      setActiveProjectId(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('bito-ai-active-project-id', activeProjectId);
    } else {
      localStorage.removeItem('bito-ai-active-project-id');
    }
  }, [activeProjectId]);


  const createProject = useCallback(async () => {
    try {
      const response = await fetch('/api/projects', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to create project');
      const newProjectData = await response.json();
      const newProject = { ...newProjectData, id: newProjectData._id };
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create a new chat.' });
    }
  }, [toast]);

  const switchProject = useCallback((id: string) => {
    if (projects.some(p => p.id === id)) {
        setActiveProjectId(id);
    }
  }, [projects]);

  const updateProjectName = useCallback(async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to update project name');
      const updatedProjectData = await response.json();
      const updatedProject = { ...updatedProjectData, id: updatedProjectData._id };

      setProjects(prev =>
        prev.map(p => (p.id === id ? updatedProject : p))
      );
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not rename chat.' });
    }
  }, [toast]);
  

  const deleteProject = useCallback(async (idToDelete: string) => {
    const originalProjects = [...projects];
    const remainingProjects = projects.filter(p => p.id !== idToDelete);
    setProjects(remainingProjects);
    
    if (activeProjectId === idToDelete) {
        setActiveProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }

    try {
      const response = await fetch(`/api/projects/${idToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete project');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete chat.' });
        setProjects(originalProjects); // Revert on failure
    }
  }, [activeProjectId, projects, toast]);

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

  const value = useMemo(() => ({
    projects,
    activeProjectId,
    activeProject,
    isLoading,
    createProject,
    switchProject,
    updateProjectName,
    deleteProject,
    refreshProjects: fetchProjects,
  }), [
    projects, 
    activeProjectId, 
    activeProject, 
    isLoading,
    createProject, 
    switchProject, 
    updateProjectName, 
    deleteProject,
    fetchProjects
  ]);

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
