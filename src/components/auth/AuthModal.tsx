"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { StudentProfile } from "@/types";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: StudentProfile) => void;
  currentUser: StudentProfile | null;
  onLogout: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout,
}: AuthModalProps) {
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
    setLoading(true);

    try {
      if (mode === "forgot") {
        if (!email.trim() || !email.includes("@")) {
          setErrorMessage("Please enter a valid student email address.");
          setLoading(false);
          return;
        }

        if (isSupabaseConfigured && supabase) {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });
          if (error) throw error;
        }

        setSuccessMessage(`Password reset link dispatched to ${email}. Check your inbox.`);
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

        // Live Supabase flow if credentials present
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                university: university.trim(),
                primary_skill: primarySkill.trim() || "Full-Stack Development",
              },
            },
          });
          if (error) throw error;

          if (data.user) {
            const newProfile: StudentProfile = {
              id: data.user.id,
              email: data.user.email,
              fullName: fullName.trim(),
              avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
              headline: `Student Innovator @ ${university}`,
              university: university.trim(),
              major: "Computer Science",
              graduationYear: 2026,
              bio: "Eager to swap technical skills, build collaborative hackathon MVPs, and learn from peers.",
              availabilityHoursPerWeek: 15,
              preferredWorkStyle: "hybrid",
              learningPreference: "both",
              timezone: "EST (UTC-5)",
              interests: ["Web Development", "AI/ML"],
              learningGoals: ["Master Next.js App Router"],
              completedProjectsCount: 1,
              completedSessionsCount: 0,
              badges: ["Verified Student", "New Builder"],
              skillsOffered: primarySkill.trim()
                ? [{ name: primarySkill.trim(), category: "frontend", proficiency: "intermediate", proficiencyLevel: 3, type: "offered" }]
                : [{ name: "Web Development", category: "frontend", proficiency: "intermediate", proficiencyLevel: 3, type: "offered" }],
              skillsSeeking: [{ name: "Machine Learning", category: "ai_ml", proficiency: "beginner", proficiencyLevel: 2, type: "seeking" }],
            };
            onLoginSuccess(newProfile);
            setSuccessMessage("Account created successfully!");
            setTimeout(onClose, 800);
            return;
          }
        }

        // Demo / offline fallback flow
        const newProfile: StudentProfile = {
          id: `user-${Date.now()}`,
          email: email.trim(),
          fullName: fullName.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          headline: `Student Builder @ ${university}`,
          university: university.trim(),
          major: "Computer Science",
          graduationYear: 2026,
          bio: "Excited to share skills and collaborate on impactful projects with fellow students.",
          availabilityHoursPerWeek: 15,
          preferredWorkStyle: "hybrid",
          learningPreference: "both",
          timezone: "PST (UTC-8)",
          interests: ["Web Development", "AI Systems"],
          learningGoals: ["Learn PyTorch and Rust"],
          completedProjectsCount: 1,
          completedSessionsCount: 0,
          badges: ["Verified Student", "Community Pioneer"],
          skillsOffered: primarySkill.trim()
            ? [{ name: primarySkill.trim(), category: "frontend", proficiency: "advanced", proficiencyLevel: 4, type: "offered" }]
            : [{ name: "Next.js", category: "frontend", proficiency: "advanced", proficiencyLevel: 4, type: "offered" }],
          skillsSeeking: [{ name: "Backend Architecture", category: "backend", proficiency: "beginner", proficiencyLevel: 2, type: "seeking" }],
        };

        onLoginSuccess(newProfile);
        setSuccessMessage("Registration successful! Welcome to SkillSwap AI.");
        setTimeout(onClose, 800);
        return;
      }

      // LOGIN MODE
      if (mode === "login") {
        if (!email.trim() || !password) {
          setErrorMessage("Please enter both email and password.");
          setLoading(false);
          return;
        }

        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;

          if (data.user) {
            const userProfile: StudentProfile = {
              id: data.user.id,
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || email.split("@")[0],
              avatarUrl: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
              headline: "SkillSwap Innovator",
              university: data.user.user_metadata?.university || "Campus University",
              major: "Computer Science",
              graduationYear: 2026,
              bio: "Passionate about reciprocal skill learning and building projects.",
              availabilityHoursPerWeek: 15,
              preferredWorkStyle: "hybrid",
              learningPreference: "both",
              timezone: "EST (UTC-5)",
              interests: ["AI/ML", "Web3"],
              learningGoals: ["Deploy Full-Stack AI"],
              completedProjectsCount: 2,
              completedSessionsCount: 0,
              badges: ["Verified Student"],
              skillsOffered: [{ name: "Next.js", category: "frontend", proficiency: "advanced", proficiencyLevel: 4, type: "offered" }],
              skillsSeeking: [{ name: "PyTorch", category: "ai_ml", proficiency: "intermediate", proficiencyLevel: 3, type: "seeking" }],
            };
            onLoginSuccess(userProfile);
            setSuccessMessage("Authenticated successfully!");
            setTimeout(onClose, 600);
            return;
          }
        }

        // Demo / offline fallback flow
        const demoUser: StudentProfile = {
          id: `user-auth-${Date.now()}`,
          email: email.trim(),
          fullName: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          headline: "Student Member @ SkillSwap AI",
          university: "University Partner",
          major: "Computer Science",
          graduationYear: 2026,
          bio: "Looking to exchange knowledge and build ambitious products.",
          availabilityHoursPerWeek: 16,
          preferredWorkStyle: "hybrid",
          learningPreference: "both",
          timezone: "EST (UTC-5)",
          interests: ["Product Design", "Distributed Systems"],
          learningGoals: ["Master Full-Stack App Router"],
          completedProjectsCount: 3,
          completedSessionsCount: 1,
          badges: ["Verified Member"],
          skillsOffered: [{ name: "TypeScript", category: "frontend", proficiency: "expert", proficiencyLevel: 5, type: "offered" }],
          skillsSeeking: [{ name: "FastAPI", category: "backend", proficiency: "intermediate", proficiencyLevel: 3, type: "seeking" }],
        };

        onLoginSuccess(demoUser);
        setSuccessMessage("Signed in successfully!");
        setTimeout(onClose, 600);
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
              ? "Welcome Back to SkillSwap AI"
              : mode === "signup"
              ? "Join the Student Skill Exchange"
              : "Reset Your Password"}
          </span>
        </div>
      }
      description={
        currentUser
          ? "Manage your active session or switch to a different account."
          : mode === "login"
          ? "Sign in with your student account to access real-time matching and collaborations."
          : mode === "signup"
          ? "Create your profile to start teaching what you know and learning what you need."
          : "Enter your registered email address and we'll dispatch a secure recovery link."
      }
    >
      {/* If already signed in, show profile overview and Logout button */}
      {currentUser ? (
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center gap-3">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{currentUser.fullName}</span>
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-300">
                  Active Session
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{currentUser.headline}</p>
              <p className="text-[11px] text-cyan-400 mt-0.5">{currentUser.university}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Backend Provider:</span>
            <span className="font-semibold text-slate-200">
              {isSupabaseConfigured ? "Live Supabase PostgreSQL" : "Local Storage Engine"}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onLogout();
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
                  Primary Skill You Can Teach (Optional)
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
                "Processing..."
              ) : mode === "login" ? (
                <>
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  Sign In to SkillSwap
                </>
              ) : mode === "signup" ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Create Student Profile
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
              By connecting, you agree to student community guidelines and fair skill exchange principles.
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
