"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BudgetGoal, ExpenseCategory } from "@/types";
import { ExpenseCategories } from "@/types";
import { Loader2 } from "lucide-react";

const budgetFormSchema = z.object({
  category: z.enum(ExpenseCategories),
  amount: z.coerce.number().positive("Budget amount must be positive."),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  // Using Omit to exclude server-generated fields from the required data
  onSubmit: (data: BudgetGoal | Omit<BudgetGoal, 'id' | 'created_at' | 'updated_at'>) => void;
  initialData?: BudgetGoal | null;
  onCancel?: () => void;
  existingCategories: ExpenseCategory[]; // To prevent duplicate budget categories
  isLoading?: boolean;
}

export function BudgetForm({ onSubmit, initialData, onCancel, existingCategories, isLoading = false }: BudgetFormProps) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: initialData
      ? initialData
      : {
          category: ExpenseCategories.find(cat => !existingCategories.includes(cat)) || ExpenseCategories[0],
          amount: 100,
        },
  });

  function handleSubmit(data: BudgetFormValues) {
    // For updates, include the id
    if (initialData && initialData.id) {
      onSubmit({
        ...data,
        id: initialData.id,
        user_id: initialData.user_id,
      });
    } else {
      // For new budgets
      onSubmit({
        user_id: initialData?.user_id || '',
        ...data,
      });
    }
    
    if (!initialData) {
      form.reset({
        category: ExpenseCategories.find(cat => !existingCategories.includes(cat) && cat !== data.category) || ExpenseCategories[0],
        amount: 100,
      });
    }
  }
  
  const availableCategories = ExpenseCategories.filter(
    cat => !existingCategories.includes(cat) || (initialData && cat === initialData.category)
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData || isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category for budget" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {initialData && <SelectItem value={initialData.category}>{initialData.category}</SelectItem>}
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && !initialData && <p className="text-sm text-muted-foreground mt-1">All categories have budgets.</p>}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Budget Amount</FormLabel>
              <FormControl>
                <Input type="number" step="1" placeholder="e.g., 500" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>}
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground" 
            disabled={(availableCategories.length === 0 && !initialData) || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Saving..." : "Setting..."}
              </>
            ) : (
              initialData ? "Save Changes" : "Set Budget"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
