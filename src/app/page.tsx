"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Target, Wallet, PieChart as PieChartIcon, BarChart3 as BarChartIcon, LogIn } from 'lucide-react';
import type { Expense, BudgetGoal, CategorizedExpenseSummary, ExpenseCategory } from '@/types';
import { ExpenseCategories } from '@/types';
import { formatCurrency, formatDate, refreshData } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { expenseService, budgetService } from '@/lib/supabase/services';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function DashboardPage() {
  const { session, user, isLoadingAuth } = useAuth();
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch data from Supabase
  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [expensesData, budgetsData] = await Promise.all([
        expenseService.getExpenses(user.id),
        budgetService.getBudgets(user.id)
      ]);
      
      setExpenses(expensesData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && !isLoadingAuth && user) {
      fetchDashboardData();
    } else if (mounted && !isLoadingAuth) {
      setIsLoading(false);
    }
  }, [user, isLoadingAuth, mounted]);

  // Set up real-time subscriptions and refresh capability
  useEffect(() => {
    if (!user) return;

    const expenseSubscription = expenseService.subscribeToExpenses(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setExpenses((prev) => [payload.new as Expense, ...prev]);
        // Also refresh complete data to ensure consistency
        fetchDashboardData();
      } else if (payload.eventType === 'UPDATE') {
        setExpenses((prev) =>
          prev.map((exp) => (exp.id === payload.new.id ? (payload.new as Expense) : exp))
        );
        fetchDashboardData();
      } else if (payload.eventType === 'DELETE') {
        setExpenses((prev) => prev.filter((exp) => exp.id !== payload.old.id));
        fetchDashboardData();
      }
    });

    const budgetSubscription = budgetService.subscribeToBudgets(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setBudgets((prev) => [payload.new as BudgetGoal, ...prev]);
        // Also refresh complete data to ensure consistency
        fetchDashboardData();
      } else if (payload.eventType === 'UPDATE') {
        setBudgets((prev) =>
          prev.map((budget) => (budget.id === payload.new.id ? (payload.new as BudgetGoal) : budget))
        );
        fetchDashboardData();
      } else if (payload.eventType === 'DELETE') {
        setBudgets((prev) => prev.filter((budget) => budget.id !== payload.old.id));
        fetchDashboardData();
      }
    });

    return () => {
      expenseSubscription.unsubscribe();
      budgetSubscription.unsubscribe();
    };
  }, [user]);
  
  // Data derived from state
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const recentExpenses = useMemo(() => 
    [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5), 
    [expenses]
  );
  const expenseSummaryByCategory: CategorizedExpenseSummary[] = useMemo(() => {
    if (totalExpenses === 0) return [];
    const summary: { [key in ExpenseCategory]?: number } = {};
    expenses.forEach(exp => {
      summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    return ExpenseCategories.map(category => ({
      category,
      total: summary[category] || 0,
      percentage: totalExpenses > 0 ? ((summary[category] || 0) / totalExpenses) * 100 : 0,
    })).filter(item => item.total > 0)
       .sort((a,b) => b.total - a.total);
  }, [expenses, totalExpenses]);

  const budgetOverview = useMemo(() => {
    return budgets.map(budget => {
      const spent = expenses
        .filter(exp => exp.category === budget.category)
        .reduce((sum, exp) => sum + exp.amount, 0);
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { ...budget, spent, progress: Math.min(progress, 100) };
    }).sort((a,b) => b.progress - a.progress).slice(0,3);
  }, [budgets, expenses]);


  if (isLoadingAuth || !mounted || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  if (!session) {
    // Show a simplified dashboard or a prompt to sign in
    return (
      <div className="space-y-6">
        <PageHeader title="Welcome to MoneyWise" description="Your personal finance companion." />
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Sign in to track your expenses, manage budgets, and gain financial insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppLogo />
            <p className="mt-4 text-muted-foreground">
              MoneyWise helps you take control of your finances with an easy-to-use interface and smart tools.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-5 w-5" /> Sign In to Continue
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Render full dashboard for authenticated users
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={`Welcome back, ${session.user?.email || 'User'}!`} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.length === 0 ? "No expenses recorded yet" : `${expenses.length} expenses recorded`}
            </p>
          </CardContent>
           <CardFooter>
             <Button asChild variant="outline" size="sm" className="w-full">
               <Link href="/expenses">View Expenses <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
           </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Goals</CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length} Active</div>
            <p className="text-xs text-muted-foreground">
              {budgets.length === 0 
                ? "No budgets set yet" 
                : `${formatCurrency(budgetOverview.reduce((sum, b) => sum + b.spent,0))} spent of ${formatCurrency(budgetOverview.reduce((sum, b) => sum + b.amount,0))}`
              }
            </p>
          </CardContent>
           <CardFooter>
             <Button asChild variant="outline" size="sm" className="w-full">
               <Link href="/budgets">Manage Budgets <ArrowRight className="ml-2 h-4 w-4" /></Link>
             </Button>
           </CardFooter>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Savings Tips</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Get Insights</div>
            <p className="text-xs text-muted-foreground">Personalized tips to save more</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/savings-ai">Discover Tips <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary" /> Spending by Category</CardTitle>
            <CardDescription>A breakdown of your expenses by category.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {expenseSummaryByCategory.length > 0 ? (
              <ChartContainer config={{}} className="mx-auto aspect-square max-h-[350px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="category" />} />
                  <Pie data={expenseSummaryByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {expenseSummaryByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                   <ChartLegend content={<ChartLegendContent nameKey="category" className="flex-wrap justify-center" />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>No expense data for chart.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/expenses">Add your first expense</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5 text-primary" /> Recent Expenses</CardTitle>
            <CardDescription>Your last 5 recorded expenses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto">
            {recentExpenses.length > 0 ? (
               <ul className="space-y-3">
                {recentExpenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">{expense.category} - {formatDate(expense.date)}</p>
                    </div>
                    <p className="font-semibold text-primary">{formatCurrency(expense.amount)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p>No expenses recorded yet.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/expenses">Add your first expense</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {budgets.length > 0 ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>How you're doing on your budgets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetOverview.map(budget => (
              <div key={budget.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{budget.category}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress value={budget.progress} className={budget.progress > 80 ? (budget.progress > 100 ? "bg-destructive/20 [&>div]:bg-destructive" : "bg-yellow-500/20 [&>div]:bg-yellow-500") : "bg-accent/20 [&>div]:bg-accent"} />
                {budget.progress > 100 && <p className="mt-1 text-xs text-destructive">Over budget by {formatCurrency(budget.spent - budget.amount)}!</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-primary" /> 
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-muted-foreground mb-4">No budget has been set. Add budget to monitor your spending.</p>
            <Button asChild>
              <Link href="/budgets">
                <Target className="mr-2 h-4 w-4" /> 
                Set Up Budgets
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
