
'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldX, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [creditAmounts, setCreditAmounts] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

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

  const handleCreditChange = (userId: string, value: string) => {
    setCreditAmounts(prev => ({ ...prev, [userId]: value }));
  };

  const handleAddCredits = async (userId: string, username: string) => {
    const amount = parseInt(creditAmounts[userId] || '0', 10);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: t('error'), description: 'Please enter a positive number.' });
      return;
    }

    setIsSubmitting(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/add-credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add credits');
      }
      setUsers(prevUsers => prevUsers.map(u => u._id === userId ? data.user : u));
      setCreditAmounts(prev => ({ ...prev, [userId]: '' }));
      toast({ title: t('creditsAddedSuccess'), description: t('creditsAddedSuccessDesc', { amount: amount, username: username }) });
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsSubmitting(null);
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
    <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
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
                                    <TableHead>Email</TableHead>
                                    <TableHead>Credits</TableHead>
                                    <TableHead className="text-right">{t('addCredits')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                <TableRow key={u._id}>
                                    <TableCell className="font-medium whitespace-nowrap">{u.username}</TableCell>
                                    <TableCell className="whitespace-nowrap">{u.email}</TableCell>
                                    <TableCell>{u.credits}</TableCell>
                                    <TableCell className="text-right">
                                        <form className="flex items-center justify-end gap-2" onSubmit={(e) => { e.preventDefault(); handleAddCredits(u._id, u.username)}}>
                                            <Input 
                                                type="number" 
                                                className="w-24 h-9" 
                                                placeholder="0"
                                                value={creditAmounts[u._id] || ''}
                                                onChange={(e) => handleCreditChange(u._id, e.target.value)}
                                                disabled={isSubmitting === u._id}
                                            />
                                            <Button size="sm" type="submit" disabled={isSubmitting === u._id || !creditAmounts[u._id]}>
                                                {isSubmitting === u._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                {t('add')}
                                            </Button>
                                        </form>
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
  );
}

export default AdminDashboard;
