'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function ExpensesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Expenses page error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Expenses</h2>
          <p className="text-muted-foreground">
            Track and manage your daily expenses.
          </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-muted p-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6 text-muted-foreground"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Unable to load expenses</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              We're having trouble loading your expense information. Don't worry, your data is safe.
            </p>
            <Button onClick={reset} className="min-w-[200px]">
              Try again
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            If this problem persists, please reload the page or try again later.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 