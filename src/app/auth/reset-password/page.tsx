"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkRecoverySession() {
      if (!supabase) {
        setIsCheckingSession(false);
        return;
      }

      // Check if current URL or session contains active recovery session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Look for hash fragments often passed by Supabase email links
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        if (!hash.includes("type=recovery") && !hash.includes("access_token")) {
          // No recovery token in hash or session
        }
      }
      setIsCheckingSession(false);
    }

    checkRecoverySession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setError("Supabase client is not available.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 rounded-3xl border border-gray-800 bg-gray-900/80 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-600/10 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Security &amp; Account Recovery</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage:
                  "linear-gradient(179.1deg, #FFFFFF 0.77%, rgba(255, 255, 255, 0.4) 182.09%)",
              }}
            >
              Set New Password
            </h1>
            <p className="text-xs text-gray-400">
              Enter your new account password to complete recovery.
            </p>
          </div>

          {isCheckingSession ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <p className="text-xs">Verifying security token...</p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Password Updated Successfully</p>
                <p className="text-xs text-gray-400">
                  Your password has been securely reset. You can now log into your SkillSwap AI account.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all duration-150"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Homepage</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>New Password</span>
                </label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-950 border-gray-800 text-xs rounded-xl focus:border-purple-500 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Confirm Password</span>
                </label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-gray-950 border-gray-800 text-xs rounded-xl focus:border-purple-500 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs py-2.5 rounded-full shadow-lg shadow-purple-600/30 transition-all duration-150"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/"
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Back to SkillSwap
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
