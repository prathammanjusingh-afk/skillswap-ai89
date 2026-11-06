"use client";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import { StudentProfile, Project, CollaborationRequest, ExchangeSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  fetchModerationReports,
  updateReportStatus,
  ModerationReport,
} from "@/lib/supabase/data-service";
import {
  ShieldAlert,
  Users,
  Rocket,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: StudentProfile;
  students: StudentProfile[];
  projects: Project[];
  requests: CollaborationRequest[];
  sessions: ExchangeSession[];
  onUpdateUserRole: (userId: string, newRole: StudentProfile["role"]) => Promise<void> | void;
  onDeleteProject: (projectId: string) => void;
}

export function AdminDashboard({
  currentUser,
  students,
  projects,
  requests,
  sessions,
  onUpdateUserRole,
  onDeleteProject,
}: AdminDashboardProps) {
  const isAdmin = currentUser.role === "admin";
  const isModerator = currentUser.role === "moderator";
  const isAuthorized = isAdmin || isModerator;

  const [activeSubTab, setActiveSubTab] = useState<"users" | "projects" | "moderation">("users");
  const [userSearch, setUserSearch] = useState("");
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [categories, setCategories] = useState<string[]>([
    "Frontend Engineering",
    "Distributed Backend",
    "AI & Machine Learning",
    "UI/UX Design Systems",
    "Cloud & DevOps",
    "Mobile Applications",
    "Hardware & IoT",
    "Product Management",
    "Data Science",
    "Cybersecurity",
    "Languages",
    "Other",
  ]);
  const [newCatInput, setNewCatInput] = useState("");

  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch real database reports if available
  useEffect(() => {
    async function loadReports() {
      if (!isAuthorized || !currentUser.id) return;
      setLoadingReports(true);
      try {
        const dbReports = await fetchModerationReports(currentUser.id);
        if (dbReports && dbReports.length > 0) {
          setReports(dbReports);
        } else {
          // Empty or non-existing table
          setReports([]);
        }
      } catch (err) {
        console.warn("[AdminDashboard] Error loading reports:", err);
      } finally {
        setLoadingReports(false);
      }
    }

    loadReports();
  }, [currentUser.id, isAuthorized]);

  // Enforce access control: Ordinary users cannot access admin operations
  if (!isAuthorized) {
    return (
      <div className="p-12 text-center rounded-3xl border border-rose-500/30 bg-gray-900/80 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Admin Access Required
        </h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          You do not have administrative permissions. Platform governance, user role modification,
          and moderation queues are strictly restricted to verified administrators in the{" "}
          <code className="text-rose-300 font-mono">admin_roles</code> database table.
        </p>
      </div>
    );
  }

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (!categories.includes(newCatInput.trim())) {
      setCategories([...categories, newCatInput.trim()]);
    }
    setNewCatInput("");
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleRoleToggle = async (userId: string, currentRole: StudentProfile["role"]) => {
    if (!isAdmin) {
      setActionMessage({ type: "error", text: "Only full administrators can reassign roles." });
      return;
    }

    setRoleUpdatingId(userId);
    setActionMessage(null);

    const nextRole: StudentProfile["role"] = currentRole === "admin" ? "student" : "admin";
    try {
      await onUpdateUserRole(userId, nextRole);
      setActionMessage({
        type: "success",
        text: `Successfully updated user role to ${nextRole.toUpperCase()}.`,
      });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Failed to update role.",
      });
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleDismissReport = async (repId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === repId ? { ...r, status: "resolved" } : r))
    );
    await updateReportStatus(currentUser.id, repId, "resolved");
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.university.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-gray-900/80 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Verified Admin Portal
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Platform Operations & Moderation
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
            Role validation, telemetry, category curation, and community trust.
          </p>
        </div>

        <Badge variant="indigo" className="text-xs px-3 py-1 self-start sm:self-auto flex items-center gap-1">
          <Lock className="w-3 h-3 text-purple-300" />
          Verified: {currentUser.role?.toUpperCase()}
        </Badge>
      </div>

      {/* Action status message banner */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            actionMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-300"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Honest Real-Time Platform Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-gray-800 bg-gray-900/70">
          <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs font-semibold uppercase">
            <Users className="w-4 h-4 text-purple-400" /> Total Students
          </div>
          <span className="text-3xl font-black text-white">{students.length}</span>
          <p className="text-[11px] text-gray-500 mt-1">Collegiate members</p>
        </div>

        <div className="p-4 rounded-2xl border border-gray-800 bg-gray-900/70">
          <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs font-semibold uppercase">
            <Rocket className="w-4 h-4 text-indigo-400" /> Active Projects
          </div>
          <span className="text-3xl font-black text-white">{projects.length}</span>
          <p className="text-[11px] text-gray-500 mt-1">Collaborations posted</p>
        </div>

        <div className="p-4 rounded-2xl border border-gray-800 bg-gray-900/70">
          <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs font-semibold uppercase">
            <Calendar className="w-4 h-4 text-emerald-400" /> Exchange Sessions
          </div>
          <span className="text-3xl font-black text-white">{sessions.length}</span>
          <p className="text-[11px] text-gray-500 mt-1">1-on-1 swaps scheduled</p>
        </div>

        <div className="p-4 rounded-2xl border border-gray-800 bg-gray-900/70">
          <div className="flex items-center gap-2 mb-1 text-gray-400 text-xs font-semibold uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Reports
          </div>
          <span className="text-3xl font-black text-white">
            {reports.filter((r) => r.status === "pending").length}
          </span>
          <p className="text-[11px] text-gray-500 mt-1">Awaiting moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveSubTab("users")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "users"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Student User Registry ({students.length})
        </button>
        <button
          onClick={() => setActiveSubTab("projects")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "projects"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Skill Categories &amp; Tags ({categories.length})
        </button>
        <button
          onClick={() => setActiveSubTab("moderation")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "moderation"
              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Community Moderation Queue ({reports.filter((r) => r.status === "pending").length})
        </button>
      </div>

      {/* Tab 1: User Registry */}
      {activeSubTab === "users" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Input
              placeholder="Search users by name or university..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-xs h-9 text-xs"
            />
            <span className="text-xs text-gray-400">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-800 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">University</th>
                  <th className="py-2.5 px-3">Visibility</th>
                  <th className="py-2.5 px-3">Skills Offered</th>
                  <th className="py-2.5 px-3">Database Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-gray-850/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      <Image src={st.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={st.fullName} width={24} height={24} className="w-6 h-6 rounded-full object-cover border border-gray-700" />
                      <span>{st.fullName}</span>
                    </td>
                    <td className="py-3 px-3 text-gray-300">{st.university}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={st.isPublic ? "success" : "outline"}
                        className="text-[10px]"
                      >
                        {st.isPublic ? "Public" : "Private"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-purple-300">
                      {st.skillsOffered.length} skills
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={st.role === "admin" ? "indigo" : "outline"}
                        className="text-[10px] uppercase font-bold"
                      >
                        {st.role || "student"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isAdmin && st.id !== currentUser.id && (
                        <button
                          disabled={roleUpdatingId === st.id}
                          onClick={() => handleRoleToggle(st.id, st.role)}
                          className="text-[11px] text-purple-400 hover:underline disabled:opacity-50"
                        >
                          {roleUpdatingId === st.id ? (
                            <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                          ) : null}
                          {st.role === "admin" ? "Demote to Member" : "Grant Admin"}
                        </button>
                      )}
                      {st.id === currentUser.id && (
                        <span className="text-[11px] text-gray-500 italic">Current Session</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Category Management */}
      {activeSubTab === "projects" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">
            Curated Skill Disciplines & Categories
          </h3>
          <p className="text-xs text-gray-400">
            Official skill disciplines that categorize peer exchange workshops and filter algorithms.
          </p>

          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="e.g. Quantum Computing, Blockchain"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              className="h-9 text-xs"
            />
            <Button size="sm" variant="default" onClick={handleAddCategory}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-700 text-xs text-gray-200"
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-gray-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Moderation Queue */}
      {activeSubTab === "moderation" && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">
            Community Safety & Moderation Reports
          </h3>

          {loadingReports ? (
            <div className="py-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              Loading moderation reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-gray-800 bg-gray-950/60 text-xs text-gray-500">
              No pending reports in the moderation queue. Community is healthy!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-xl border border-gray-800 bg-gray-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">Reported: {rep.reportedUserName}</span>
                      <Badge variant={rep.status === "pending" ? "amber" : "success"} className="text-[10px]">
                        {rep.status}
                      </Badge>
                    </div>
                    <p className="text-gray-300">{rep.reason}</p>
                    {rep.details && (
                      <p className="text-[11px] text-gray-400 mt-1 italic">&ldquo;{rep.details}&rdquo;</p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-1">
                      Submitted on {new Date(rep.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {rep.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        onClick={() => handleDismissReport(rep.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Resolve / Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
