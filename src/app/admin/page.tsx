
'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldX, UserCog, Ban, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ManagedUser {
  _id: string;
  username: string;
  email: string;
  credits: number;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  createdAt: string;
  projectCount: number;
}

function AdminDashboard() {
  const { user: adminUser, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{ type: 'role' | 'status' | 'credits', payload: any } | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (adminUser?.role !== 'admin') {
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
  }, [adminUser, isAuthLoading, toast, t]);

  const handleOpenDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    setAmountToAdd('');
    setIsManageDialogOpen(true);
  };
  
  const handleConfirmAction = (type: 'role' | 'status' | 'credits', payload: any) => {
    setActionToConfirm({ type, payload });
    setIsConfirmDialogOpen(true);
  }

  const executeAction = async () => {
    if (!actionToConfirm || !selectedUser) return;

    let url = '';
    let body = {};
    const { type, payload } = actionToConfirm;

    switch (type) {
      case 'credits':
        const amount = parseInt(payload, 10);
        if (isNaN(amount) || amount <= 0) {
          toast({ variant: 'destructive', title: t('error'), description: 'Please enter a positive number.' });
          return;
        }
        url = `/api/admin/users/${selectedUser._id}/add-credits`;
        body = { amount };
        break;
      case 'role':
        url = `/api/admin/users/${selectedUser._id}/update-role`;
        body = { role: payload };
        break;
      case 'status':
        url = `/api/admin/users/${selectedUser._id}/update-status`;
        body = { status: payload };
        break;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }
      
      const updatedUser = data.user;
      setUsers(prevUsers => prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
      setSelectedUser(updatedUser); // Update user in dialog
      toast({ title: t('actionSuccess'), description: data.message });

    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsSubmitting(false);
      setIsConfirmDialogOpen(false);
      setActionToConfirm(null);
      if(type === 'credits') setAmountToAdd('');
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

  if (adminUser?.role !== 'admin') {
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
                                      <TableHead>Role</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {users.map((u) => (
                                  <TableRow key={u._id} className={u.status === 'banned' ? 'bg-destructive/10' : ''}>
                                      <TableCell className="font-medium">{u.username}</TableCell>
                                      <TableCell><Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{u.role}</Badge></TableCell>
                                      <TableCell><Badge variant={u.status === 'banned' ? 'destructive' : 'outline'} className="capitalize">{u.status}</Badge></TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(u)} disabled={u._id === adminUser._id}>
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

      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><UserCog/> Manage: {selectedUser?.username}</DialogTitle>
                  <DialogDescription>
                    View user details and manage their account.
                  </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                  <div className="space-y-4 py-2">
                      <div className="text-sm space-y-2 text-muted-foreground p-4 border rounded-lg">
                          <p><strong className="font-medium text-foreground">Email:</strong> {selectedUser.email}</p>
                          <p><strong className="font-medium text-foreground">User ID:</strong> {selectedUser._id}</p>
                          <p><strong className="font-medium text-foreground">Joined:</strong> {format(new Date(selectedUser.createdAt), 'PPP')}</p>
                          <p><strong className="font-medium text-foreground">Total Chats:</strong> {selectedUser.projectCount}</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg space-y-3">
                        <Label className="font-semibold text-foreground">Credits</Label>
                        <p className="text-sm text-muted-foreground">Current Credits: {selectedUser.credits}</p>
                        <div className="flex items-center gap-2">
                          <Input 
                              id="credits" type="number" placeholder="Amount to add" value={amountToAdd}
                              onChange={(e) => setAmountToAdd(e.target.value)}
                              disabled={isSubmitting}
                          />
                          <Button onClick={() => handleConfirmAction('credits', amountToAdd)} disabled={isSubmitting || !amountToAdd}>
                              {isSubmitting && actionToConfirm?.type === 'credits' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              {t('addCredits')}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg space-y-3">
                          <Label htmlFor="role" className="font-semibold text-foreground">Role</Label>
                          <Select 
                            value={selectedUser.role} 
                            onValueChange={(newRole) => handleConfirmAction('role', newRole)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="p-4 border rounded-lg space-y-3">
                          <Label className="font-semibold text-foreground">Status</Label>
                          {selectedUser.status === 'active' ? (
                            <Button variant="destructive" className="w-full" onClick={() => handleConfirmAction('status', 'banned')} disabled={isSubmitting}>
                              <Ban className="mr-2 h-4 w-4"/> {t('banUser')}
                            </Button>
                          ) : (
                             <Button variant="secondary" className="w-full" onClick={() => handleConfirmAction('status', 'active')} disabled={isSubmitting}>
                              <CheckCircle2 className="mr-2 h-4 w-4"/> {t('unbanUser')}
                            </Button>
                          )}
                        </div>
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmAction')}</AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm?.type === 'credits' && `Are you sure you want to add ${actionToConfirm.payload} credits to ${selectedUser?.username}?`}
              {actionToConfirm?.type === 'role' && `Are you sure you want to change ${selectedUser?.username}'s role to ${actionToConfirm.payload}?`}
              {actionToConfirm?.type === 'status' && `Are you sure you want to ${actionToConfirm.payload === 'banned' ? 'ban' : 'unban'} ${selectedUser?.username}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default AdminDashboard;
