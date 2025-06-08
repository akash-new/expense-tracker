import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, dateFormat: string = 'MMM d, yyyy'): string {
  try {
    return format(new Date(dateString), dateFormat);
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return dateString; // Fallback to original string if formatting fails
  }
}

/**
 * Refreshes data by either refreshing the page or calling provided refresh functions
 * @param refreshFunctions Optional functions to call for refreshing data without page reload
 */
export function refreshData(refreshFunctions?: (() => Promise<void>)[]) {
  if (refreshFunctions && refreshFunctions.length > 0) {
    // Execute all provided refresh functions
    Promise.all(refreshFunctions.map(fn => fn()));
  } else {
    // Fallback to refreshing the page
    window.location.reload();
  }
}
