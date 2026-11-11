"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  // Mode: "request" (Stage A: enter email) or "update" (Stage B: enter new password)
  const [mode, setMode] = useState<"request" | "update">("request");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Stage A states
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  // Stage B states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function evaluateRecoverySession() {
      if (!supabase) {
        if (mounted) setIsCheckingSession(false);
        return;
      }

      try {
        // 1. Check current URL hash (Supabase default recovery redirect)
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        const isRecoveryHash =
          hash.includes("type=recovery") || hash.includes("access_token");

        // 2. Check search params (some email templates pass code or type=recovery)
        const search = typeof window !== "undefined" ? window.location.search : "";
        const isRecoverySearch =
          search.includes("type=recovery") || search.includes("code=");

        // 3. Check active session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isRecoveryHash || isRecoverySearch || session) {
          if (mounted) {
            setMode("update");
          }
        } else {
          if (mounted) {
            setMode("request");
          }
        }
      } catch (err) {
        console.warn("[ResetPassword] Session check error:", err);
      } finally {
        if (mounted) setIsCheckingSession(false);
      }
    }

    evaluateRecoverySession();

    // Listen for auth state change specifically for PASSWORD_RECOVERY
    const {
      data: { subscription },
    } = supabase
      ? supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            if (mounted) {
              setMode("update");
              setIsCheckingSession(false);
            }
          }
        })
      : { data: { subscription: null } };

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Handler for Stage A: Request password reset email
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setRequestMessage("Please enter a valid student email address.");
      return;
    }

    if (!supabase) {
      setRequestMessage("Supabase client is not configured.");
      return;
    }

    setRequestLoading(true);
    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/reset-password`
          : "https://skillswap-ai89.vercel.app/auth/reset-password";

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setRequestMessage(error.message);
      } else {
        setRequestSuccess(true);
        setRequestMessage(
          `If an account exists for ${trimmedEmail}, a password recovery email has been dispatched. Please inspect your inbox and spam folder.`
        );
      }
    } catch (err: any) {
      setRequestMessage(
        err?.message || "Failed to dispatch recovery email. Please try again."
      );
    } finally {
      setRequestLoading(false);
    }
  };

  // Handler for Stage B: Set new password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);

    if (password.length < 6) {
      setUpdateError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setUpdateError("Passwords do not match.");
      return;
    }

    if (!supabase) {
      setUpdateError("Supabase client is not available.");
      return;
    }

    setUpdateLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        // If the session expired or token is invalid, inform user cleanly
        if (
          error.message.toLowerCase().includes("session") ||
          error.message.toLowerCase().includes("auth")
        ) {
          setUpdateError(
            "Your recovery link has expired or is invalid. Please request a new recovery link below."
          );
        } else {
          setUpdateError(error.message);
        }
      } else {
        setUpdateSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setUpdateError(err?.message || "An unexpected error occurred.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-4 relative overflow-x-hidden w-full max-w-full">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-gray-800 bg-gray-900/80 shadow-2xl backdrop-blur-xl space-y-6">
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
              {mode === "request" ? "Reset Password" : "Set New Password"}
            </h1>
            <p className="text-xs text-gray-400">
              {mode === "request"
                ? "Enter your student email address to receive a secure password recovery link."
                : "Enter and confirm your new account password to complete recovery."}
            </p>
          </div>

          {isCheckingSession ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <p className="text-xs">Verifying security session...</p>
            </div>
          ) : mode === "request" ? (
            /* ==========================================
               STAGE A: REQUEST PASSWORD RESET EMAIL
               ========================================== */
            <div>
              {requestSuccess ? (
                <div className="space-y-4 py-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Recovery Link Sent</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {requestMessage}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRequestSuccess(false)}
                      className="w-full text-xs rounded-full border-gray-800 hover:bg-gray-800"
                    >
                      Send to another address
                    </Button>
                    <Link
                      href="/login"
                      className="text-xs text-purple-400 hover:underline pt-1 block"
                    >
                      Return to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestReset} className="space-y-4 text-xs">
                  {requestMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{requestMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-300 block">
                      Student Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        type="email"
                        placeholder="student@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-9 h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="purple"
                    size="sm"
                    disabled={requestLoading}
                    className="w-full h-10 text-xs rounded-full shadow-lg shadow-purple-600/30 font-semibold"
                  >
                    {requestLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Dispatching Link...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Send Password Reset Link
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("update")}
                      className="text-[11px] text-gray-400 hover:text-purple-300 transition-colors"
                    >
                      Already have an active recovery session or link? Click here
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ==========================================
               STAGE B: SET NEW PASSWORD
               ========================================== */
            <div>
              {updateSuccess ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Password Updated Successfully</p>
                    <p className="text-xs text-gray-400">
                      Your password has been securely reset. Redirecting to login in 2 seconds...
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all duration-150"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Proceed to Sign In</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                  {updateError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{updateError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>New Password (min 6 characters) *</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pr-9 h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Confirm New Password *</span>
                    </label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="purple"
                    size="sm"
                    disabled={updateLoading}
                    className="w-full h-10 text-xs rounded-full shadow-lg shadow-purple-600/30 font-semibold"
                  >
                    {updateLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Updating Password...
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("request")}
                      className="text-[11px] text-gray-400 hover:text-purple-300 transition-colors"
                    >
                      Need to request a reset link first? Click here
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
