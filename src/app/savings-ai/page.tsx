"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lightbulb, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { Expense } from '@/types';
import { getSavingTips } from '@/ai/flows/get-saving-tips';
import usePersistentState from '@/hooks/usePersistentState';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { formatCurrency, refreshData } from "@/lib/utils";
import { expenseService } from '@/lib/supabase/services';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

// Define the types locally since they might not be exported from @/types
interface GetSavingTipsInput {
  spendingHabits: string;
}

interface GetSavingTipsOutput {
  savingTips: string;
}

export default function AISavingsPage() {
  const { session, isLoadingAuth, user } = useAuth();
  const router = useRouter();
  
  // Will be replaced with Supabase data
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [spendingHabits, setSpendingHabits] = useState('');
  const [savingTips, setSavingTips] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoadingAuth && !session) {
      router.push('/auth/signin');
    }
  }, [session, isLoadingAuth, router, mounted]);

  // Function to fetch expense data
  const fetchSavingsData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await expenseService.getExpenses(user.id);
      setExpenses(data);
      console.log(`Fetched ${data.length} expenses for AI savings recommendations`);
    } catch (error) {
      console.error('Error fetching savings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    if (mounted && session && user) {
      fetchSavingsData();
    }
  }, [mounted, session, user]);

  // Set up real-time subscription for expenses
  useEffect(() => {
    if (!user) return;

    const subscription = expenseService.subscribeToExpenses(user.id, (payload: any) => {
      // When data changes, refresh the data
      fetchSavingsData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const generateSpendingSummary = () => {
    if (expenses.length === 0) {
      return "No expense data available. Please add some expenses first or describe your general spending habits.";
    }
    const summaryByCategory: { [category: string]: number } = {};
    expenses.forEach(exp => {
      summaryByCategory[exp.category] = (summaryByCategory[exp.category] || 0) + exp.amount;
    });

    let summaryText = "Here's a summary of my recent spending:\n";
    for (const [category, total] of Object.entries(summaryByCategory)) {
      summaryText += `- ${category}: approx ${formatCurrency(total)}\n`;
    }
    summaryText += "\nI also tend to [describe any specific habits, e.g., eat out 3 times a week, subscribe to multiple streaming services, impulse buy online].";
    return summaryText;
  };

  useEffect(() => {
    if(mounted && session && expenses.length > 0) { 
      setSpendingHabits(generateSpendingSummary());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, mounted, session]);

  const handleGetTips = async () => {
    if (!spendingHabits.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your spending habits or ensure expenses are recorded.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingApi(true);
    setSavingTips(null);
    setErrorMessage(null);
    
    try {
      console.log("Getting saving tips with input:", { 
        inputLength: spendingHabits.length,
        inputPreview: spendingHabits.substring(0, 100) + (spendingHabits.length > 100 ? '...' : '')
      });
      
      const input: GetSavingTipsInput = { spendingHabits };
      
      // Try to get saving tips from the AI service
      let output: GetSavingTipsOutput;
      try {
        output = await getSavingTips(input);
      } catch (aiError) {
        console.error("AI service error:", aiError);
        
        // Use fallback basic tips if AI service fails
        output = {
          savingTips: generateFallbackTips(spendingHabits)
        };
        
        // Show a toast about using fallback
        toast({
          title: "Using Fallback Tips",
          description: "The AI service is currently unavailable. Showing basic tips instead.",
          variant: "destructive",
        });
      }
      
      console.log("Received saving tips response:", { 
        success: !!output, 
        outputLength: output?.savingTips?.length,
        outputPreview: output?.savingTips?.substring(0, 100) + (output?.savingTips?.length > 100 ? '...' : '')
      });
      
      if (!output || !output.savingTips) {
        throw new Error("No tips were generated. The AI service may be unavailable.");
      }
      
      setSavingTips(output.savingTips);
      toast({
        title: "Savings Tips Generated!",
        description: "Check out your personalized advice below.",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error getting saving tips:", error);
      console.error("Detailed error information:", {
        message: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown Error',
      });
      
      setSavingTips("Sorry, I couldn't generate tips at this moment. Please try again later.");
      setErrorMessage(errorMsg);
      
      toast({
        title: "Error",
        description: "Failed to generate saving tips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApi(false);
    }
  };
  
  // Fallback tips generator when AI service isn't available
  const generateFallbackTips = (habits: string): string => {
    // Extract categories from habits text
    const categories = [
      { name: 'Food', emoji: '🍲', keywords: ['food', 'grocery', 'eating', 'restaurant', 'dining'] },
      { name: 'Entertainment', emoji: '🎬', keywords: ['entertainment', 'movie', 'streaming', 'subscription'] },
      { name: 'Shopping', emoji: '🛍️', keywords: ['shopping', 'clothes', 'buy', 'purchase'] },
      { name: 'Transportation', emoji: '🚗', keywords: ['transportation', 'travel', 'car', 'fuel', 'gas', 'petrol'] },
      { name: 'Housing', emoji: '🏠', keywords: ['rent', 'mortgage', 'home', 'apartment', 'house'] },
      { name: 'Utilities', emoji: '💡', keywords: ['utility', 'utilities', 'electricity', 'water', 'gas', 'bill'] },
    ];
    
    let tips = "# Smart Saving Tips\n\n";
    tips += "Here are personalized saving tips based on your spending profile:\n\n";
    
    // Add general tips
    tips += "## General Recommendations\n";
    tips += "- Track all your expenses to gain better awareness of your spending patterns\n";
    tips += "- Create a monthly budget and try to stick to it\n";
    tips += "- Consider using the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n";
    tips += "- Look for unnecessary subscriptions and cancel them\n";
    tips += "- Set up automatic transfers to your savings account on payday\n\n";
    
    // Add category-specific tips based on what's mentioned in the habits
    const habitsLower = habits.toLowerCase();
    let categoriesFound = 0;
    
    for (const category of categories) {
      if (category.keywords.some(keyword => habitsLower.includes(keyword))) {
        categoriesFound++;
        tips += `## ${category.emoji} ${category.name} Tips\n`;
        
        switch (category.name) {
          case 'Food':
            tips += "- Cook more meals at home instead of eating out\n";
            tips += "- Plan meals and make a shopping list before going to the grocery store\n";
            tips += "- Buy in bulk for non-perishable items when they're on sale\n";
            tips += "- Reduce food waste by planning leftovers\n";
            tips += "- Consider meatless meals a few times a week to save money\n";
            break;
            
          case 'Entertainment':
            tips += "- Share subscription services with family or friends\n";
            tips += "- Look for free or low-cost entertainment options in your community\n";
            tips += "- Consider rotating subscriptions instead of having them all active at once\n";
            tips += "- Use your library for books, movies, and other media\n";
            tips += "- Look for discounts and special offers for activities you enjoy\n";
            break;
            
          case 'Shopping':
            tips += "- Wait 24-48 hours before making non-essential purchases\n";
            tips += "- Use cashback and reward programs when shopping\n";
            tips += "- Look for sales, especially during seasonal changes\n";
            tips += "- Consider buying second-hand for certain items\n";
            tips += "- Create a wishlist and prioritize purchases instead of impulse buying\n";
            break;
            
          case 'Transportation':
            tips += "- Use public transportation when possible\n";
            tips += "- Carpool with colleagues or friends\n";
            tips += "- Maintain your vehicle properly to avoid costly repairs\n";
            tips += "- Compare fuel prices at different stations\n";
            tips += "- Consider walking or biking for short distances to save money and improve health\n";
            break;
            
          case 'Housing':
            tips += "- Negotiate your rent when renewing your lease\n";
            tips += "- Consider a roommate to split housing costs\n";
            tips += "- Reduce energy costs by using efficient appliances and mindful consumption\n";
            tips += "- DIY simple home repairs and maintenance when possible\n";
            tips += "- Refinance your mortgage if interest rates have dropped significantly\n";
            break;
            
          case 'Utilities':
            tips += "- Use programmable thermostats to optimize heating and cooling\n";
            tips += "- Switch to energy-efficient lighting and appliances\n";
            tips += "- Compare providers for better rates on internet and phone services\n";
            tips += "- Fix leaky faucets and toilets to save on water bills\n";
            tips += "- Wash clothes in cold water and hang to dry when possible\n";
            break;
        }
        
        tips += "\n";
      }
    }
    
    // If no specific categories were found, add some general category tips
    if (categoriesFound === 0) {
      tips += "## 🛒 Everyday Spending Tips\n";
      tips += "- Use comparison apps to find the best prices before making purchases\n";
      tips += "- Take advantage of loyalty programs and cashback offers\n";
      tips += "- Challenge yourself with a 'no-spend' day each week\n";
      tips += "- Consider minimalism and focus on experiences rather than material goods\n";
      tips += "- Set specific financial goals to motivate your saving efforts\n\n";
    }
    
    tips += "**Remember:** Small changes in your daily habits can add up to significant savings over time. The most important step is to start today!";
    
    return tips;
  };

  if (isLoadingAuth || !mounted || !session) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading AI Advisor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Savings Advisor"
        description="Leverage AI to get personalized tips based on your spending habits and improve your financial health."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Describe Your Spending
          </CardTitle>
          <CardDescription>
            Provide details about your spending habits. You can use the auto-generated summary from your expenses or customize it. The more details, the better the tips!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I spend about ₹5,000/month on dining out, ₹1,500 on subscriptions..."
            value={spendingHabits}
            onChange={(e) => setSpendingHabits(e.target.value)}
            rows={8}
            className="text-base"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleGetTips} disabled={isLoadingApi} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoadingApi ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Get Saving Tips
          </Button>
        </CardFooter>
      </Card>

      {savingTips && (
        <Card className="shadow-xl bg-gradient-to-br from-accent/10 via-background to-background border-accent/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              Your Personalized Saving Tips
            </CardTitle>
            <CardDescription>
              Based on your spending patterns and financial habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-dashed border-accent/30 bg-accent/5 p-5 shadow-sm">
              <MarkdownRenderer content={savingTips} className="tips-content" />
            </div>
          </CardContent>
          <CardFooter className="pt-2 text-sm text-muted-foreground italic">
            <p>Start implementing these tips to see improvements in your financial health.</p>
          </CardFooter>
        </Card>
      )}
      
      {errorMessage && (
        <Card className="shadow-xl bg-destructive/5 border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This error information is only visible in development mode:
            </p>
            <pre className="mt-2 p-4 bg-muted/50 rounded-md overflow-x-auto text-xs">
              {errorMessage}
            </pre>
            <div className="mt-4 p-4 bg-muted/30 rounded-md">
              <h4 className="font-medium mb-2">Common Issues:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Missing API keys - Check that <code>GOOGLE_API_KEY</code> is set in your environment</li>
                <li>Invalid API key format - Verify your Google AI API key is valid</li>
                <li>Network connectivity - Check your connection to the Google AI services</li>
                <li>Permission issues - Ensure your API key has access to the Gemini models</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

declare module '@/types' {
    export interface GetSavingTipsInput {
        spendingHabits: string;
    }
    export interface GetSavingTipsOutput {
        savingTips: string;
    }
}