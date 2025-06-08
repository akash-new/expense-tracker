"use client";

import type { ReactNode, Dispatch, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isLoadingAuth: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  console.log('Auth Provider initializing');
  const supabase = createSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  const signInWithGoogle = useCallback(async () => {
    console.log('Attempting to sign in with Google');
    setIsLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        setIsLoadingAuth(false);
      } else {
        console.log('Sign in with Google initiated successfully', data);
      }
    } catch (err) {
      console.error('Exception during Google sign in:', err);
      setIsLoadingAuth(false);
    }
    // Supabase handles redirection
  }, [supabase]);

  const signOut = useCallback(async () => {
    console.log('Signing out user');
    setIsLoadingAuth(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      console.log('User signed out successfully');
      router.push('/auth/signin'); // Redirect to sign-in after logout
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    console.log('Setting up auth session and listeners');
    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Session retrieved:', currentSession ? 'Session exists' : 'No session');
          if (currentSession?.user) {
            console.log('User authenticated:', currentSession.user.id);
          }
          
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (err) {
        console.error('Exception getting session:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('Auth state changed:', event, newSession ? 'Session exists' : 'No session');
        if (newSession?.user) {
          console.log('User ID in new session:', newSession.user.id);
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoadingAuth(false);
        
        if (event === 'SIGNED_IN' && newSession) {
          console.log('User signed in successfully');
         // Optionally redirect on sign-in if not handled by callback
        }
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to signin page');
          router.push('/auth/signin');
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listeners');
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ supabase, session, user, isLoadingAuth, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};