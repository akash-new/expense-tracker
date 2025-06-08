"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { BudgetForm } from '@/components/BudgetForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Target, Loader2 } from 'lucide-react';
import type { BudgetGoal, Expense, ExpenseCategory } from '@/types';
import { ExpenseCategories } from '@/types';
import { formatCurrency, refreshData } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { budgetService, expenseService } from '@/lib/supabase/services';

export default function BudgetsPage() {
  const { session, user, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [budgets, setBudgets] = useState<BudgetGoal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetGoal | null>(null);
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

  // Create a function to fetch budget data
  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [budgetsData, expensesData] = await Promise.all([
        budgetService.getBudgets(user.id),
        expenseService.getExpenses(user.id)
      ]);
      
      setBudgets(budgetsData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load budgets. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch budgets and expenses when user is authenticated
  useEffect(() => {
    if (mounted && !isLoadingAuth && user) {
      fetchData();
    }
  }, [user, isLoadingAuth, mounted, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const budgetSubscription = budgetService.subscribeToBudgets(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setBudgets((prev) => [payload.new as BudgetGoal, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setBudgets((prev) =>
          prev.map((budget) => (budget.id === payload.new.id ? (payload.new as BudgetGoal) : budget))
        );
      } else if (payload.eventType === 'DELETE') {
        setBudgets((prev) => prev.filter((budget) => budget.id !== payload.old.id));
      }
    });

    const expenseSubscription = expenseService.subscribeToExpenses(user.id, (payload) => {
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
      budgetSubscription.unsubscribe();
      expenseSubscription.unsubscribe();
    };
  }, [user]);

  const existingBudgetedCategories = useMemo(() => budgets.map(b => b.category), [budgets]);

  const handleAddBudget = async (newBudget: Omit<BudgetGoal, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await budgetService.addBudget({
        ...newBudget,
        user_id: user.id,
      });
      setIsFormOpen(false);
      toast({ title: "Budget Set", description: `Budget for ${newBudget.category} successfully set.` });
      // Refresh data
      refreshData([fetchData]);
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to set budget. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBudget = async (updatedBudget: BudgetGoal | Omit<BudgetGoal, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Check if id exists in the updatedBudget
      if ('id' in updatedBudget && updatedBudget.id) {
        const { id, ...budgetData } = updatedBudget;
        await budgetService.updateBudget(id, budgetData);
        setEditingBudget(null);
        setIsFormOpen(false);
        toast({ title: "Budget Updated", description: `Budget for ${updatedBudget.category} successfully updated.` });
        // Refresh data
        refreshData([fetchData]);
      } else {
        toast({
          title: 'Error',
          description: 'Budget ID is missing. Cannot update budget.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to update budget. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return;
    
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        setIsLoading(true);
        const budgetToDelete = budgets.find(b => b.id === budgetId);
        await budgetService.deleteBudget(budgetId);
        if (budgetToDelete) {
          toast({ title: "Budget Deleted", description: `Budget for ${budgetToDelete.category} successfully deleted.`, variant: "destructive" });
          // Refresh data
          refreshData([fetchData]);
        }
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete budget. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditForm = (budget: BudgetGoal) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };
  
  const openNewForm = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  }

  const budgetsWithProgress = useMemo(() => {
    return budgets.map(budget => {
      const spent = expenses
        .filter(exp => exp.category === budget.category)
        .reduce((sum, exp) => sum + exp.amount, 0);
      const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
      const overspent = budget.amount > 0 ? Math.max(0, spent - budget.amount) : 0;
      return { ...budget, spent, progress, overspent };
    }).sort((a, b) => a.category.localeCompare(b.category));
  }, [budgets, expenses]);

  if (isLoadingAuth || !mounted || !session) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Budgets...</p>
      </div>
    );
  }

  const allCategoriesHaveBudgets = ExpenseCategories.every(cat => existingBudgetedCategories.includes(cat));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Budgets"
        description="Set and track your monthly spending goals for each category."
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openNewForm} 
                disabled={(allCategoriesHaveBudgets && !editingBudget) || isLoading} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-5 w-5" />
                )}
                {editingBudget ? 'Edit Budget' : 'Set New Budget'}
              </Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget Goal' : 'Set New Budget Goal'}</DialogTitle>
                <DialogDescription>
                  {editingBudget ? 'Update your budget amount for this category.' : 'Define a new monthly budget for a category.'}
                </DialogDescription>
              </DialogHeader>
              <BudgetForm
                onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
                initialData={editingBudget}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingBudget(null);
                }}
                existingCategories={existingBudgetedCategories}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : budgetsWithProgress.length === 0 ? (
         <Card className="shadow-md">
            <CardContent className="py-10 text-center text-muted-foreground">
              <Target className="mx-auto h-12 w-12 mb-4 text-primary" />
              <p className="text-lg font-semibold">No budgets set yet.</p>
              <p>Click "Set New Budget" to start planning your finances.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgetsWithProgress.map((budget) => {
            const IconComponent = CATEGORY_ICONS[budget.category] || CATEGORY_ICONS["Others"];
            const progressColor = budget.overspent > 0 ? "bg-destructive" : (budget.progress > 80 ? "bg-yellow-500" : "bg-accent");
            return (
              <Card key={budget.id} className="shadow-md flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-2">
                     <IconComponent className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditForm(budget)} 
                      className="h-7 w-7 text-blue-500 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4" />
                       <span className="sr-only">Edit Budget</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteBudget(budget.id)} 
                      className="h-7 w-7 text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Delete Budget</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(budget.amount)}</div>
                  <p className="text-xs text-muted-foreground">Monthly Budget</p>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Spent: {formatCurrency(budget.spent)}</span>
                      <span>{budget.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={budget.progress} className={`h-3 ${budget.overspent > 0 ? 'bg-destructive/20' : (budget.progress > 80 ? 'bg-yellow-500/20' : 'bg-accent/20')} [&>div]:${progressColor}`} />
                    {budget.overspent > 0 && (
                      <p className="mt-1 text-xs text-destructive">
                        Over budget by {formatCurrency(budget.overspent)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
       {allCategoriesHaveBudgets && budgets.length > 0 && (
          <p className="text-center text-muted-foreground mt-6">All categories have budgets set. You can edit existing ones.</p>
        )}
    </div>
  );
}