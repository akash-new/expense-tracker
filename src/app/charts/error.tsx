'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function ChartsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Charts page error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Spending Charts</h2>
          <p className="text-muted-foreground">
            Visualize your financial patterns to make informed decisions.
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
                <path d="M3 3v18h18" />
                <path d="M18 12V8" />
                <path d="M13 12v-2" />
                <path d="M8 12v-5" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Unable to display charts</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              We're having trouble generating your spending charts. This might be due to missing data or a temporary issue.
            </p>
            <Button onClick={reset} className="min-w-[200px]">
              Try again
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            Charts require your expense data to be properly loaded. Make sure you have recorded some expenses.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 