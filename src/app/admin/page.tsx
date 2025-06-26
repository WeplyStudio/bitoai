
'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ManagedUser {
  _id: string;
  username: string;
  email: string;
  credits: number;
}

function AdminDashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== 'admin') {
        setIsLoadingUsers(false);
        return;
      }
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast({ variant: 'destructive', title: t('error'), description: 'Could not load users.' });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    if (!isAuthLoading) {
        fetchUsers();
    }
  }, [user, isAuthLoading, toast, t]);

  const handleOpenDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setAmountToAdd('');
    setIsDialogOpen(true);
  };

  const handleAddCredits = async () => {
    if (!selectedUser) return;
    
    const amount = parseInt(amountToAdd, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: t('error'), description: 'Please enter a positive number.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}/add-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add credits');
      }
      setUsers(prevUsers => prevUsers.map(u => u._id === selectedUser._id ? data.user : u));
      setIsDialogOpen(false);
      toast({ title: t('creditsAddedSuccess'), description: t('creditsAddedSuccessDesc', { amount, username: selectedUser.username }) });
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsSubmitting(false);
      setSelectedUser(null);
    }
  };

  if (isAuthLoading) {
      return (
          <div className="p-8">
              <Skeleton className="h-10 w-64 mb-6" />
              <Card>
                  <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                  <CardContent><Skeleton className="h-64 w-full" /></CardContent>
              </Card>
          </div>
      )
  }

  if (user?.role !== 'admin') {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
            <ShieldX className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('accessDenied')}</h1>
            <p className="text-muted-foreground max-w-md">{t('accessDeniedDescription')}</p>
        </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                  <div>
                      <h2 className="text-3xl font-bold tracking-tight">{t('adminDashboard')}</h2>
                      <p className="text-muted-foreground">{t('manageUsersAndCredits')}</p>
                  </div>
              </div>
              <Card>
                  <CardHeader>
                      <CardTitle>{t('totalUsers')}: {users.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      {isLoadingUsers ? (
                          <Skeleton className="h-64 w-full" />
                      ) : (
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Username</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {users.map((u) => (
                                  <TableRow key={u._id}>
                                      <TableCell className="font-medium">{u.username}</TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(u)}>
                                          Manage
                                        </Button>
                                      </TableCell>
                                  </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      )}
                  </CardContent>
              </Card>
          </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>Manage: {selectedUser?.username}</DialogTitle>
                  <DialogDescription>
                    View user details and add credits.
                  </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                  <div className="space-y-4 py-2">
                      <div className="text-sm space-y-1 text-muted-foreground">
                          <p><span className="font-medium text-foreground">Email:</span> {selectedUser.email}</p>
                          <p><span className="font-medium text-foreground">Current Credits:</span> {selectedUser.credits}</p>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="credits">{t('addCredits')}</Label>
                          <Input 
                              id="credits"
                              type="number" 
                              placeholder="Enter amount"
                              value={amountToAdd}
                              onChange={(e) => setAmountToAdd(e.target.value)}
                              disabled={isSubmitting}
                          />
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleAddCredits} disabled={isSubmitting || !amountToAdd}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('addCredits')}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminDashboard;
