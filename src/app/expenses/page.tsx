"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Expense } from '@/types';
import { formatCurrency, formatDate, refreshData } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { expenseService } from '@/lib/supabase/services';

export default function ExpensesPage() {
  const { session, user, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingAuth && !session) {
      router.push('/auth/signin');
    }
  }, [session, isLoadingAuth, router, mounted]);

  // Create a function to fetch expenses data
  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await expenseService.getExpenses(user.id);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch expenses when user is authenticated
  useEffect(() => {
    if (mounted && !isLoadingAuth && user) {
      fetchExpenses();
    }
  }, [user, isLoadingAuth, mounted, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const subscription = expenseService.subscribeToExpenses(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setExpenses((prev) => [payload.new as Expense, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === payload.new.id ? (payload.new as Expense) : exp))
        );
      } else if (payload.eventType === 'DELETE') {
        setExpenses((prev) => prev.filter((exp) => exp.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleAddExpense = async (newExpense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await expenseService.addExpense({
        ...newExpense,
        user_id: user.id,
      });
      setIsFormOpen(false);
      toast({ title: "Expense Added", description: `${newExpense.description} successfully added.` });
      // Refresh data
      refreshData([fetchExpenses]);
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExpense = async (updatedExpense: Omit<Expense, 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { id, ...expenseData } = updatedExpense;
      await expenseService.updateExpense(id, expenseData);
      setEditingExpense(null);
      setIsFormOpen(false);
      toast({ title: "Expense Updated", description: `${updatedExpense.description} successfully updated.` });
      // Refresh data
      refreshData([fetchExpenses]);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to update expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!user) return;
    
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        setIsLoading(true);
        const expenseToDelete = expenses.find(exp => exp.id === expenseId);
        await expenseService.deleteExpense(expenseId);
        if (expenseToDelete) {
          toast({ title: "Expense Deleted", description: `${expenseToDelete.description} successfully deleted.`, variant: "destructive" });
          // Refresh data
          refreshData([fetchExpenses]);
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete expense. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  }

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoadingAuth || !mounted || !session) {
     return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Expenses"
        description="Track and categorize your spending efficiently."
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewForm} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                <DialogDescription>
                  {editingExpense ? 'Update the details of your expense.' : 'Fill in the details to add a new expense.'}
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm
                onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
                initialData={editingExpense}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingExpense(null);
                }}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>A list of your recent expenses by date.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expenses recorded yet.</p>
              <Button onClick={openNewForm} variant="link" className="mt-2">
                Add your first expense
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => {
                  const IconComponent = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS["Others"];
                  return (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell>{formatDate(expense.date, 'dd MMM')}</TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditForm(expense)} 
                          className="mr-1 text-blue-500 hover:text-blue-700"
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteExpense(expense.id)} 
                          className="text-red-500 hover:text-red-700"
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}