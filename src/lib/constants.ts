import type { ExpenseCategory } from '@/types';
import { Utensils, ShoppingCart, Home, Train, Car, Clapperboard, Phone, Landmark, TrendingUp, CircleDollarSign, Grip } from 'lucide-react';

export const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  "Food & Drinks": Utensils,
  "Shopping": ShoppingCart,
  "Housing": Home,
  "Transportation": Train,
  "Vehicle": Car,
  "Entertainment": Clapperboard,
  "Communication, PC": Phone,
  "Financial expenses": Landmark,
  "Investments": TrendingUp,
  "Income": CircleDollarSign,
  "Others": Grip,
};
