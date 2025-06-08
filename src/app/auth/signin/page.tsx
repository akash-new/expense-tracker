"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/AppLogo';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation
import { Loader2 } from 'lucide-react';

// Simple SVG for Google Icon
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l0.002-0.001l6.19,5.238C39.902,35.392,44,30.064,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export default function SignInPage() {
  const { signInWithGoogle, session, isLoadingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && session) {
      router.push('/'); // Redirect to dashboard if already logged in
    }
  }, [session, isLoadingAuth, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is logged in AuthContext, could show a toast here
      console.error("Sign in failed from page", error);
    }
  };

  if (isLoadingAuth || session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to your MoneyWise dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSignIn} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
            disabled={isLoadingAuth}
          >
            {isLoadingAuth ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span className="ml-2">Sign in with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}