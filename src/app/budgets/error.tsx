'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function BudgetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Budgets page error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Your Budgets</h2>
          <p className="text-muted-foreground">
            Manage your budget goals and track your spending limits.
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
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                <path d="M7 7h.01" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Unable to load budgets</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              We're having trouble loading your budget information. This is usually a temporary issue.
            </p>
            <Button onClick={reset} className="min-w-[200px]">
              Try again
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            If this problem persists, please check your network connection and try clearing your browser cache.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 