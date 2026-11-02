"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface UseProfilePrivacyOptions {
  initialIsPublic?: boolean;
  userId?: string;
  onUpdate?: (isPublic: boolean) => void;
}

export function useProfilePrivacy({
  initialIsPublic = false,
  userId,
  onUpdate,
}: UseProfilePrivacyOptions = {}) {
  const [isPublic, setIsPublicState] = useState<boolean>(initialIsPublic);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | string | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state if initialIsPublic changes from parent/auth sync
  useEffect(() => {
    setIsPublicState(initialIsPublic);
  }, [initialIsPublic]);

  // Clean up success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const togglePrivacy = useCallback(
    async (nextState: boolean) => {
      const prevState = isPublic;
      // Optimistic update
      setIsPublicState(nextState);
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }

      try {
        if (isSupabaseConfigured && supabase && userId) {
          // 1. Persist directly to Supabase profiles table
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ is_public: nextState } as any)
            .eq("id", userId);

          if (profileError) {
            // If the table or column is temporarily unavailable, check error
            console.warn("[Privacy] Supabase profiles update warning:", profileError.message);
            // If it's a critical error (e.g. permission violation), throw it
            if (profileError.code !== "PGRST205" && profileError.code !== "42P01") {
              throw profileError;
            }
          }

          // 2. Also keep Supabase auth user_metadata in sync
          try {
            const { error: authError } = await supabase.auth.updateUser({
              data: { isPublic: nextState, is_public: nextState },
            });
            if (authError) {
              console.warn("[Privacy] Auth metadata update warning:", authError.message);
            }
          } catch (authErr) {
            console.warn("[Privacy] Non-fatal auth metadata update error:", authErr);
          }
        }

        // Notify parent callback
        if (onUpdate) {
          onUpdate(nextState);
        }

        setSuccess(
          nextState
            ? "Profile is now public and visible in the marketplace."
            : "Profile is now private and hidden from search."
        );

        successTimerRef.current = setTimeout(() => {
          setSuccess(null);
        }, 3500);
      } catch (err: any) {
        // Rollback state on failure
        setIsPublicState(prevState);
        setError(err.message || "Failed to persist profile visibility setting.");
      } finally {
        setLoading(false);
      }
    },
    [isPublic, userId, onUpdate]
  );

  return {
    isPublic,
    setIsPublic: setIsPublicState,
    togglePrivacy,
    loading,
    success,
    error,
  };
}
