'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Your financial overview at a glance.
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
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="9" x2="9" y1="21" y2="9" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Dashboard temporarily unavailable</h3>
            <p className="mb-6 max-w-md text-sm text-muted-foreground">
              We're having trouble loading your dashboard information. Your data is still safe and accessible through other sections.
            </p>
            <Button onClick={reset} className="min-w-[200px]">
              Refresh Dashboard
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            Try navigating to specific sections like Expenses or Budgets to access your financial data.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 