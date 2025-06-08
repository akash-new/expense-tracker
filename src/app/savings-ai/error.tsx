'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function SavingsAIError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Savings AI error:', error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">AI Savings Advisor</h2>
          <p className="text-muted-foreground">
            Get personalized tips based on your spending habits.
          </p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            AI Service Temporarily Unavailable
          </CardTitle>
          <CardDescription>
            Our AI advisor service is currently taking a short break. Please try again in a moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-muted p-6 text-center">
            <h3 className="mb-2 text-lg font-medium">We apologize for the inconvenience</h3>
            <p className="mb-4 text-muted-foreground">
              The AI savings advisor is experiencing temporary difficulties. This could be due to high demand or a brief service interruption.
            </p>
            <Button onClick={reset} className="min-w-[200px]">
              Try again
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <p>
            You can still manually track your expenses and set budgets while the AI service is being restored.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 