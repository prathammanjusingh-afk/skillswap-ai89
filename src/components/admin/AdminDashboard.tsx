"use client";

import React, { useState } from "react";
import { StudentProfile, Project, CollaborationRequest, ExchangeSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  TrendingUp,
  Sliders,
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: StudentProfile;
  students: StudentProfile[];
  projects: Project[];
  requests: CollaborationRequest[];
  sessions: ExchangeSession[];
  onUpdateUserRole: (userId: string, newRole: StudentProfile["role"]) => void;
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
  const [activeSubTab, setActiveSubTab] = useState<"users" | "projects" | "moderation">("users");
  const [userSearch, setUserSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Frontend Engineering",
    "Distributed Backend",
    "AI & Machine Learning",
    "UI/UX Design Systems",
    "Cloud & DevOps",
    "Mobile Applications",
    "Cybersecurity",
    "Data Science",
  ]);
  const [newCatInput, setNewCatInput] = useState("");

  const [reports, setReports] = useState([
    {
      id: "rep-1",
      reportedUser: "David Kim",
      reason: "No-show for scheduled learning session without notice",
      reportedBy: "Maya Lin",
      status: "pending",
      date: "Oct 30, 2026",
    },
  ]);

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

  const handleDismissReport = (repId: string) => {
    setReports(reports.map((r) => (r.id === repId ? { ...r, status: "resolved" } : r)));
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.university.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl border border-cyan-500/30 bg-navy-900/80 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Superadmin Management Portal
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Platform Operations & Moderation
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time telemetry, student verification, category curation, and community trust.
          </p>
        </div>

        <Badge variant="indigo" className="text-xs px-3 py-1 self-start sm:self-auto">
          Role: Admin (Verified)
        </Badge>
      </div>

      {/* Honest Real-Time Platform Telemetry (No Fake Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase">
            <Users className="w-4 h-4 text-cyan-400" /> Total Students
          </div>
          <span className="text-3xl font-black text-white">{students.length}</span>
          <p className="text-[11px] text-slate-500 mt-1">Verified collegiate members</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase">
            <Rocket className="w-4 h-4 text-indigo-400" /> Active Projects
          </div>
          <span className="text-3xl font-black text-white">{projects.length}</span>
          <p className="text-[11px] text-slate-500 mt-1">Recruiting collaborations</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase">
            <Calendar className="w-4 h-4 text-emerald-400" /> Exchange Sessions
          </div>
          <span className="text-3xl font-black text-white">{sessions.length}</span>
          <p className="text-[11px] text-slate-500 mt-1">Arranged 1-on-1 sessions</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70">
          <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Pending Reports
          </div>
          <span className="text-3xl font-black text-white">
            {reports.filter((r) => r.status === "pending").length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab("users")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === "users"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Student User Registry ({students.length})
        </button>
        <button
          onClick={() => setActiveSubTab("projects")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === "projects"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Skill Categories & Tags ({categories.length})
        </button>
        <button
          onClick={() => setActiveSubTab("moderation")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === "moderation"
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Community Moderation Queue
        </button>
      </div>

      {/* Tab 1: User Registry */}
      {activeSubTab === "users" && (
        <div className="rounded-2xl border border-slate-800 bg-navy-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Input
              placeholder="Search users by name or university..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-xs h-9 text-xs"
            />
            <span className="text-xs text-slate-400">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">University</th>
                  <th className="py-2.5 px-3">Major</th>
                  <th className="py-2.5 px-3">Skills Offered</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                      <img
                        src={st.avatarUrl}
                        alt={st.fullName}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span>{st.fullName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{st.university}</td>
                    <td className="py-3 px-3 text-slate-400">{st.major}</td>
                    <td className="py-3 px-3 text-cyan-300">
                      {st.skillsOffered.length} skills
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {st.role || "student"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() =>
                          onUpdateUserRole(
                            st.id,
                            st.role === "admin" ? "student" : "admin"
                          )
                        }
                        className="text-[11px] text-cyan-400 hover:underline"
                      >
                        {st.role === "admin" ? "Demote to Member" : "Grant Admin"}
                      </button>
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
        <div className="rounded-2xl border border-slate-800 bg-navy-900/70 p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">
            Curated Skill Categories
          </h3>
          <p className="text-xs text-slate-400">
            Define official skill disciplines that categorize peer exchange workshops and filter algorithms.
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-slate-200"
              >
                <span>{cat}</span>
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-500 hover:text-rose-400"
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
        <div className="rounded-2xl border border-slate-800 bg-navy-900/70 p-5 space-y-4">
          <h3 className="font-bold text-white text-sm">
            Community Safety & Incident Reports
          </h3>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-xl border border-slate-800 bg-navy-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">Reported: {rep.reportedUser}</span>
                    <Badge variant={rep.status === "pending" ? "amber" : "success"} className="text-[10px]">
                      {rep.status}
                    </Badge>
                  </div>
                  <p className="text-slate-300">{rep.reason}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Submitted by {rep.reportedBy} on {rep.date}
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
        </div>
      )}
    </div>
  );
}
