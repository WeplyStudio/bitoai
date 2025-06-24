
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const PROJECTS_KEY = 'bito-ai-projects';
const ACTIVE_PROJECT_ID_KEY = 'bito-ai-active-project-id';
const CHAT_HISTORY_KEY = 'bito-ai-chat-history'; // Old key for migration
const CHAT_HISTORIES_KEY = 'bito-ai-chat-histories'; // New key for project-based histories

export interface Project {
  id: string;
  name: string;
  summary: string;
  createdAt: number;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | undefined;
  createProject: () => void;
  switchProject: (id: string) => void;
  updateActiveProjectSummary: (summary: string) => void;
  updateProjectName: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const migrateOldChatHistory = useCallback(() => {
    const oldHistoryRaw = localStorage.getItem(CHAT_HISTORY_KEY);
    const newHistoriesRaw = localStorage.getItem(CHAT_HISTORIES_KEY);

    if (oldHistoryRaw && !newHistoriesRaw) {
      try {
        const oldHistory = JSON.parse(oldHistoryRaw);
        if (Array.isArray(oldHistory) && oldHistory.length > 0) {
          const newProject: Project = {
            id: `migrated-${Date.now()}`,
            name: 'My First Chat',
            summary: 'Migrated chat history.',
            createdAt: Date.now(),
          };
          setProjects([newProject]);
          setActiveProjectId(newProject.id);
          localStorage.setItem(PROJECTS_KEY, JSON.stringify([newProject]));
          localStorage.setItem(ACTIVE_PROJECT_ID_KEY, newProject.id);
          localStorage.setItem(CHAT_HISTORIES_KEY, JSON.stringify({ [newProject.id]: oldHistory }));
          localStorage.removeItem(CHAT_HISTORY_KEY);
        } else {
            localStorage.removeItem(CHAT_HISTORY_KEY);
        }
      } catch (error) {
        console.error('Failed to migrate old chat history:', error);
        localStorage.removeItem(CHAT_HISTORY_KEY); // Remove corrupted old history
      }
    }
  }, []);

  useEffect(() => {
    try {
        migrateOldChatHistory();
        const savedProjects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
        const savedActiveId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);

        if (savedProjects.length > 0) {
            setProjects(savedProjects);
            setActiveProjectId(savedActiveId && savedProjects.some((p: Project) => p.id === savedActiveId) ? savedActiveId : savedProjects[0].id);
        } else {
            // Create a default project if none exist
            const newProject: Project = {
                id: `project-${Date.now()}`,
                name: 'Untitled Project',
                summary: 'Start a new conversation!',
                createdAt: Date.now()
            };
            setProjects([newProject]);
            setActiveProjectId(newProject.id);
        }
    } catch (error) {
        console.error("Failed to load projects from localStorage", error);
        // Handle potential corrupted data
        localStorage.removeItem(PROJECTS_KEY);
        localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    } finally {
        setIsMounted(true);
    }
  }, [migrateOldChatHistory]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      if (activeProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_ID_KEY, activeProjectId);
      }
    }
  }, [projects, activeProjectId, isMounted]);

  const createProject = useCallback(() => {
    const newProject: Project = {
        id: `project-${Date.now()}`,
        name: 'Untitled Project',
        summary: 'A new conversation begins...',
        createdAt: Date.now()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  }, []);

  const switchProject = useCallback((id: string) => {
    if (projects.some(p => p.id === id)) {
        setActiveProjectId(id);
    }
  }, [projects]);

  const updateProjectProperty = useCallback((id: string, updates: Partial<Omit<Project, 'id'>>) => {
      setProjects(prev =>
          prev.map(p => (p.id === id ? { ...p, ...updates } : p))
      );
  }, []);

  const updateActiveProjectSummary = useCallback((summary: string) => {
    if (activeProjectId) {
      updateProjectProperty(activeProjectId, { summary });
    }
  }, [activeProjectId, updateProjectProperty]);

  const updateProjectName = useCallback((id: string, name: string) => {
    updateProjectProperty(id, { name });
  }, [updateProjectProperty]);
  
  const deleteProject = useCallback((idToDelete: string) => {
    // Remove associated chat history
    const allHistories = JSON.parse(localStorage.getItem(CHAT_HISTORIES_KEY) || '{}');
    delete allHistories[idToDelete];
    localStorage.setItem(CHAT_HISTORIES_KEY, JSON.stringify(allHistories));

    let newActiveProjectId = activeProjectId;

    const remainingProjects = projects.filter(p => p.id !== idToDelete);

    if (activeProjectId === idToDelete) {
        if (remainingProjects.length > 0) {
            // Switch to the most recent project
            const mostRecentProject = [...remainingProjects].sort((a,b) => b.createdAt - a.createdAt)[0];
            newActiveProjectId = mostRecentProject.id;
        } else {
            // If no projects are left, create a new one
            const newProject: Project = {
                id: `project-${Date.now()}`,
                name: 'Untitled Project',
                summary: 'Start a new conversation!',
                createdAt: Date.now()
            };
            setProjects([newProject]);
            setActiveProjectId(newProject.id);
            return;
        }
    }
    
    setProjects(remainingProjects);
    setActiveProjectId(newActiveProjectId);

  }, [activeProjectId, projects]);


  const activeProject = projects.find(p => p.id === activeProjectId);

  const value = {
    projects,
    activeProjectId,
    activeProject,
    createProject,
    switchProject,
    updateActiveProjectSummary,
    updateProjectName,
    deleteProject
  };

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
