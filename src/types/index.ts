export const ExpenseCategories = [
  "Food & Drinks",
  "Shopping",
  "Housing",
  "Transportation",
  "Vehicle",
  "Entertainment",
  "Communication, PC",
  "Financial expenses",
  "Investments",
  "Income",
  "Others",
] as const;

export type ExpenseCategory = typeof ExpenseCategories[number];

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  created_at: string;
  updated_at: string;
}

export interface BudgetGoal {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface CategorizedExpenseSummary {
  category: ExpenseCategory;
  total: number;
  percentage: number;
}
