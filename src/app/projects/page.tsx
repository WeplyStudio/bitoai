'use client';

import { useState } from 'react';
import { Project, useProjects } from '@/contexts/ProjectProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Edit, Save } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, updateProjectName, deleteProject } = useProjects();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const { toast } = useToast();

  const handleStartEditing = (project: Project) => {
    setEditingProjectId(project.id);
    setNewProjectName(project.name);
  };

  const handleCancelEditing = () => {
    setEditingProjectId(null);
    setNewProjectName('');
  };

  const handleSaveName = (projectId: string) => {
    if (newProjectName.trim()) {
      updateProjectName(projectId, newProjectName.trim());
      toast({ title: 'Chat Renamed', description: `Chat has been renamed to "${newProjectName.trim()}".` });
      handleCancelEditing();
    }
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    toast({ variant: 'destructive', title: 'Chat Deleted', description: 'The chat and its history have been deleted.' });
  };
  
  const sortedProjects = [...projects].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Manage Chats</h2>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
              <h3 className="text-xl font-semibold">No Chats Yet</h3>
              <p className="text-muted-foreground mt-2">Create a new chat from the sidebar to get started!</p>
          </div>
        ) : (
          <div className="grid max-w-md mx-auto gap-6 sm:max-w-none sm:mx-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedProjects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-2">
                      <Input 
                        value={newProjectName} 
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(project.id);
                          if (e.key === 'Escape') handleCancelEditing();
                        }}
                        autoFocus
                        onBlur={handleCancelEditing}
                        className="h-9"
                      />
                    </div>
                  ) : (
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="break-words">{project.name}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleStartEditing(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  )}
                  <CardDescription>
                    Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{project.summary}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  {editingProjectId === project.id ? (
                      <>
                          <Button variant="ghost" onClick={handleCancelEditing}>Cancel</Button>
                          <Button onClick={() => handleSaveName(project.id)}>
                              <Save className="mr-2 h-4 w-4" /> Save
                          </Button>
                      </>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your chat
                            and its entire chat history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteProject(project.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
