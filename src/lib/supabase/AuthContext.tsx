"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { StudentProfile } from "@/types";
import { getOrCreateProfile } from "./auth-service";

interface AuthContextType {
  currentUser: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: {
    email: string;
    password: string;
    fullName: string;
    university: string;
    primarySkill?: string;
  }) => Promise<{ success: boolean; requiresEmailVerification?: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<StudentProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load and sync authenticated user from Supabase session
  const syncUserFromSession = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      const profile = await getOrCreateProfile(session.user);
      setCurrentUser(profile);
    } catch (err) {
      console.error("[AuthProvider] Session sync error:", err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncUserFromSession();

    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await getOrCreateProfile(session.user);
        setCurrentUser(profile);
      } else if (event === "SIGNED_OUT") {
        setCurrentUser(null);
      } else if (event === "USER_UPDATED" && session?.user) {
        const profile = await getOrCreateProfile(session.user);
        setCurrentUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUserFromSession]);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: "Supabase authentication is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return {
            success: false,
            error:
              "Your account was created, but your email has not been verified yet. Please check your inbox for the confirmation link.",
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await getOrCreateProfile(data.user);
        setCurrentUser(profile);
        return { success: true };
      }

      return { success: false, error: "Login failed: No user returned." };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred during login." };
    }
  };

  const signup = async ({
    email,
    password,
    fullName,
    university,
    primarySkill,
  }: {
    email: string;
    password: string;
    fullName: string;
    university: string;
    primarySkill?: string;
  }) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: "Supabase authentication is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            university: university.trim(),
            primary_skill: primarySkill?.trim() || "Full-Stack Development",
          },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if email confirmation is required (session is null when email confirmation is active)
        if (!data.session) {
          return {
            success: true,
            requiresEmailVerification: true,
          };
        }

        const profile = await getOrCreateProfile(data.user);
        setCurrentUser(profile);
        return { success: true };
      }

      return { success: false, error: "Registration failed: No user returned." };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred during registration." };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("[AuthProvider] Logout error:", err);
      }
    }
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error: "Supabase authentication is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to dispatch password reset request." };
    }
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          "Supabase authentication is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      };
    }

    try {
      const targetUrl =
        redirectTo ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: targetUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error:
          err.message || "An unexpected error occurred while initiating Google sign-in.",
      };
    }
  };

  const refreshProfile = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profile = await getOrCreateProfile(user);
      setCurrentUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        isConfigured: isSupabaseConfigured,
        login,
        signup,
        logout,
        resetPassword,
        signInWithGoogle,
        refreshProfile,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
