"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Expense, ExpenseCategory, CategorizedExpenseSummary } from '@/types';
import { ExpenseCategories } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import usePersistentState from '@/hooks/usePersistentState';
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Loader2 } from 'lucide-react'; // For loading state
import { formatCurrency, refreshData } from '@/lib/utils';
import { expenseService } from '@/lib/supabase/services';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))', 'hsl(var(--accent))'];

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-1))",
  },
  ...Object.fromEntries(ExpenseCategories.map((cat, i) => [cat, { label: cat, color: COLORS[i % COLORS.length] }]))
};

export default function ChartsPage() {
  const { session, isLoadingAuth, user } = useAuth();
  const router = useRouter();

  // This will be replaced with Supabase data fetching later
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingAuth && !session) {
      router.push('/auth/signin');
    }
  }, [session, isLoadingAuth, router, mounted]);

  // Function to fetch expense data
  const fetchChartData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Replace this with Supabase data fetching:
      const data = await expenseService.getExpenses(user.id);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (mounted && session && user) {
      fetchChartData();
    }
  }, [mounted, session, user]);

  // Set up real-time subscription for expenses
  useEffect(() => {
    if (!user) return;

    const subscription = expenseService.subscribeToExpenses(user.id, (payload: any) => {
      // When data changes, refresh the chart data
      fetchChartData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const monthOptions = useMemo(() => {
    const options = new Set<string>();
    expenses.forEach(exp => {
      options.add(format(parseISO(exp.date), 'yyyy-MM'));
    });
    for (let i = 0; i < 6; i++) {
      options.add(format(subMonths(new Date(), i), 'yyyy-MM'));
    }
    return Array.from(options).sort((a,b) => b.localeCompare(a));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!selectedMonth) return expenses;
    const SDate = startOfMonth(parseISO(`${selectedMonth}-01`));
    const EDate = endOfMonth(parseISO(`${selectedMonth}-01`));
    return expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return expDate >= SDate && expDate <= EDate;
    });
  }, [expenses, selectedMonth]);
  
  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0), [filteredExpenses]);

  const expenseSummaryByCategory: CategorizedExpenseSummary[] = useMemo(() => {
    if (totalExpenses === 0) return [];
    const summary: { [key in ExpenseCategory]?: number } = {};
    filteredExpenses.forEach(exp => {
      summary[exp.category] = (summary[exp.category] || 0) + exp.amount;
    });
    return ExpenseCategories.map(category => ({
      category,
      total: summary[category] || 0,
      percentage: totalExpenses > 0 ? ((summary[category] || 0) / totalExpenses) * 100 : 0,
    })).filter(item => item.total > 0)
       .sort((a,b) => b.total - a.total);
  }, [filteredExpenses, totalExpenses]);

  const dailySpending = useMemo(() => {
    const dailyData: { [key: string]: number } = {};
    filteredExpenses.forEach(exp => {
      const day = format(parseISO(exp.date), 'MMM dd');
      dailyData[day] = (dailyData[day] || 0) + exp.amount;
    });
    return Object.entries(dailyData).map(([name, expenses]) => ({ name, expenses })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [filteredExpenses]);

  if (isLoadingAuth || !mounted || !session) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Charts...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Spending Charts"
        description="Visualize your financial patterns to make informed decisions."
        actions={
           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month} value={month}>
                  {format(parseISO(`${month}-01`), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Distribution of your expenses across categories for {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pb-0">
            {expenseSummaryByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
                    <Pie
                        data={expenseSummaryByCategory}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (percent * 100) > 5 ? ( 
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                            ) : null;
                        }}
                    >
                        {expenseSummaryByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--background)" style={{outline: "none"}} />
                        ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="category" className="mt-4 flex-wrap justify-center" />} />
                    </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No expense data for this month.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daily Spending Trend</CardTitle>
            <CardDescription>Your spending pattern throughout {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')}.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] pb-0">
             {dailySpending.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailySpending} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={5} />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value)} 
                              tick={{ fontSize: 12 }} 
                              tickMargin={10}
                              width={80}
                              domain={[0, 'auto']}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No daily spending data for this month.</div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}