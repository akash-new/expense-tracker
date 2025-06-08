import { createSupabaseBrowserClient } from './client';
import type { Database } from '@/types/supabase';
import type { Expense, BudgetGoal } from '@/types';

// Create Supabase client and log initialization
const supabase = createSupabaseBrowserClient();
console.log('Supabase client initialized with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Expense Services
export const expenseService = {
  async getExpenses(userId: string) {
    console.log('Fetching expenses for user:', userId);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} expenses`);
      return data as Expense[];
    } catch (error) {
      console.error('Exception in getExpenses:', error);
      throw error;
    }
  },

  async addExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Adding expense:', expense);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        throw error;
      }
      
      console.log('Successfully added expense:', data);
      return data as Expense;
    } catch (error) {
      console.error('Exception in addExpense:', error);
      throw error;
    }
  },

  async updateExpense(id: string, expense: Partial<Expense>) {
    console.log('Updating expense:', id, expense);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expense)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        throw error;
      }
      
      console.log('Successfully updated expense:', data);
      return data as Expense;
    } catch (error) {
      console.error('Exception in updateExpense:', error);
      throw error;
    }
  },

  async deleteExpense(id: string) {
    console.log('Deleting expense:', id);
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }
      
      console.log('Successfully deleted expense:', id);
    } catch (error) {
      console.error('Exception in deleteExpense:', error);
      throw error;
    }
  },

  subscribeToExpenses(userId: string, callback: (payload: any) => void) {
    console.log('Setting up real-time subscription for expenses, user:', userId);
    return supabase
      .channel('expenses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log('Real-time expense update received:', payload);
          callback(payload);
        }
      )
      .subscribe((status: any) => {
        console.log('Expense subscription status:', status);
      });
  },
};

// Budget Services
export const budgetService = {
  async getBudgets(userId: string) {
    console.log('Fetching budgets for user:', userId);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching budgets:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} budgets`);
      return data as BudgetGoal[];
    } catch (error) {
      console.error('Exception in getBudgets:', error);
      throw error;
    }
  },

  async addBudget(budget: Omit<BudgetGoal, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Adding budget:', budget);
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget])
        .select()
        .single();

      if (error) {
        console.error('Error adding budget:', error);
        throw error;
      }
      
      console.log('Successfully added budget:', data);
      return data as BudgetGoal;
    } catch (error) {
      console.error('Exception in addBudget:', error);
      throw error;
    }
  },

  async updateBudget(id: string, budget: Partial<BudgetGoal>) {
    console.log('Updating budget with ID:', id);
    console.log('Budget data being sent:', budget);
    
    if (!id || id === 'undefined') {
      console.error('Invalid budget ID:', id);
      throw new Error('Invalid budget ID: ' + id);
    }
    
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating budget:', error);
        throw error;
      }
      
      console.log('Successfully updated budget:', data);
      return data as BudgetGoal;
    } catch (error) {
      console.error('Exception in updateBudget:', error);
      throw error;
    }
  },

  async deleteBudget(id: string) {
    console.log('Deleting budget:', id);
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget:', error);
        throw error;
      }
      
      console.log('Successfully deleted budget:', id);
    } catch (error) {
      console.error('Exception in deleteBudget:', error);
      throw error;
    }
  },

  subscribeToBudgets(userId: string, callback: (payload: any) => void) {
    console.log('Setting up real-time subscription for budgets, user:', userId);
    return supabase
      .channel('budgets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log('Real-time budget update received:', payload);
          callback(payload);
        }
      )
      .subscribe((status: any) => {
        console.log('Budget subscription status:', status);
      });
  },
}; 