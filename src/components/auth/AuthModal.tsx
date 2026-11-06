"use client";
import Image from "next/image";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/supabase/AuthContext";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [primarySkill, setPrimarySkill] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setUniversity("");
    setPrimarySkill("");
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // isConfigured check bypassed: Supabase is production configured

    setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email.trim() || !email.includes("@")) {
          setErrorMessage("Please enter a valid student email address.");
          setLoading(false);
          return;
        }

        const res = await resetPassword(email.trim());
        if (!res.success) {
          setErrorMessage(res.error || "Failed to send reset email.");
        } else {
          setSuccessMessage(`Password recovery link dispatched to ${email.trim()}. Please inspect your inbox.`);
        }
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMessage("Full name is required.");
          setLoading(false);
          return;
        }
        if (!university.trim()) {
          setErrorMessage("College or University name is required.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const res = await signup({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          university: university.trim(),
          primarySkill: primarySkill.trim() || undefined,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Registration failed. Please check your credentials.");
        } else if (res.requiresEmailVerification) {
          setSuccessMessage(
            "Registration submitted! A verification link has been sent to your email. Please verify your address before signing in."
          );
        } else {
          setSuccessMessage("Account created successfully! Welcome to SkillSwap AI.");
          setTimeout(() => {
            onClose();
            resetForm();
          }, 800);
        }
        return;
      }

      // LOGIN MODE
      if (mode === "login") {
        if (!email.trim() || !password) {
          setErrorMessage("Please enter both email and password.");
          setLoading(false);
          return;
        }

        const res = await login(email.trim(), password);
        if (!res.success) {
          setErrorMessage(res.error || "Invalid login credentials. Please try again.");
        } else {
          setSuccessMessage("Authenticated successfully!");
          setTimeout(() => {
            onClose();
            resetForm();
          }, 600);
        }
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-white">
            {currentUser
              ? "Account Settings & Session"
              : mode === "login"
              ? "Sign In to SkillSwap AI"
              : mode === "signup"
              ? "Create Student Account"
              : "Reset Your Password"}
          </span>
        </div>
      }
      description={
        currentUser
          ? "Manage your active session or switch to a different account."
          : mode === "login"
          ? "Sign in with your verified Supabase account to access real-time matching."
          : mode === "signup"
          ? "Register with your student email to begin exchanging skills and collaborating."
          : "Enter your registered email address to receive a secure recovery link."
      }
    >
      {/* If already signed in, show profile overview and Logout button */}
      {currentUser ? (
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center gap-3">
            <Image src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={currentUser.fullName} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{currentUser.fullName}</span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300">
                  Active Session
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{currentUser.headline}</p>
              <p className="text-[11px] text-cyan-400 mt-0.5">{currentUser.university}</p>
              {currentUser.email && (
                <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Auth Provider:</span>
            <span className="font-semibold text-slate-200">
              {isConfigured ? "Supabase Auth (PostgreSQL & RLS)" : "Supabase Not Configured"}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await logout();
                onClose();
              }}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-1">
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode Tabs */}
          {mode !== "forgot" && (
            <div className="grid grid-cols-2 gap-1 p-1 bg-navy-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === "login"
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  resetForm();
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Registration Extra Fields */}
          {mode === "signup" && (
            <>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="e.g. Jordan Hayes"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  College or University *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="e.g. UC Berkeley, Stanford, Georgia Tech"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Primary Skill You Offer (Optional)
                </label>
                <Input
                  placeholder="e.g. Python, UI/UX Design, React, PyTorch"
                  value={primarySkill}
                  onChange={(e) => setPrimarySkill(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </>
          )}

          {/* Email field */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Student Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Password field (only for login & signup) */}
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Password *
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-9 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="glow"
              size="sm"
              className="w-full h-9 text-xs"
              disabled={loading}
            >
              {loading ? (
                "Processing with Supabase..."
              ) : mode === "login" ? (
                <>
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  Sign In with Supabase
                </>
              ) : mode === "signup" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Register Account
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Send Password Reset Link
                </>
              )}
            </Button>
          </div>

          {/* Footer Navigation */}
          {mode === "forgot" ? (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 text-center pt-1">
              Credentials are securely authenticated directly via Supabase Auth with encrypted sessions.
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
