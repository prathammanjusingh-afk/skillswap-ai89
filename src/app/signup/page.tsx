"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup, currentUser, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [primarySkill, setPrimarySkill] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect to home/dashboard
  useEffect(() => {
    if (isAuthenticated || currentUser) {
      router.push("/");
    }
  }, [isAuthenticated, currentUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!university.trim()) {
      setErrorMessage("College or University name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid student email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await signup({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        university: university.trim(),
        primarySkill: primarySkill.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(
          res.error || "Registration failed. Please check your information."
        );
        setLoading(false);
      } else if (res.requiresEmailVerification) {
        setSuccessMessage(
          "Registration submitted! A verification link has been sent to your email. Please verify your address before signing in."
        );
        setLoading(false);
      } else {
        setSuccessMessage("Account created successfully! Welcome to SkillSwap AI.");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to SkillSwap AI</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-gray-900/80 border border-gray-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 shadow-md shadow-purple-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Create Student Account
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Join SkillSwap AI to exchange skills and build teams
            </p>
          </div>
        </div>

        {/* Error & Success Banners */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Continue with Google */}
        <div className="space-y-4">
          <GoogleSignInButton onError={(err) => setErrorMessage(err)} />

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-gray-800 w-full" />
            <span className="bg-gray-900 px-3 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
              or register with student email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="e.g. Jordan Hayes"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                College or University *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="e.g. UC Berkeley, Stanford, Georgia Tech"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="pl-9 h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                Primary Skill You Offer (Optional)
              </label>
              <Input
                placeholder="e.g. Python, UI/UX Design, React, PyTorch"
                value={primarySkill}
                onChange={(e) => setPrimarySkill(e.target.value)}
                className="h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                Student Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-300 block mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="•••••••• (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10 text-xs bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
                  required
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

            <Button
              type="submit"
              variant="purple"
              size="sm"
              className="w-full h-10 text-xs rounded-full shadow-lg shadow-purple-600/30 font-semibold mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Register Account
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link to Login */}
        <div className="mt-6 pt-5 border-t border-gray-800/80 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 font-semibold hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
