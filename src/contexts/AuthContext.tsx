import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createPersonalWorkspace = async (userId: string, userEmail: string) => {
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: `${userEmail}'s Workspace`
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create membership
      const { error: memberError } = await supabase
        .from('memberships')
        .insert({
          user_id: userId,
          org_id: org.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Welcome!",
        description: "Your personal workspace has been created.",
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Welcome!",
        description: "Signed in successfully.",
      });
    }
  };

  const checkFirstLogin = async (user: User) => {
    try {
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) throw error;

      // If no memberships exist, this is first login
      if (!memberships || memberships.length === 0) {
        await createPersonalWorkspace(user.id, user.email || 'User');
      }
    } catch (error) {
      console.error('Error checking first login:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle first login
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            checkFirstLogin(session.user);
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};