"use client";
import Image from "next/image";

import React from "react";
import {
  StudentProfile,
  Project,
  CollaborationRequest,
  SynergyBreakdown,
} from "@/types";
import { calculateStudentSynergy } from "@/lib/ai-matchmaker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Users,
  Rocket,
  MessageSquare,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
  Bell,
} from "lucide-react";

interface DashboardProps {
  currentUser: StudentProfile;
  students: StudentProfile[];
  projects: Project[];
  requests: CollaborationRequest[];
  onNavigate: (tab: string) => void;
  onOpenStudentDetail: (student: StudentProfile, synergy: SynergyBreakdown) => void;
  onOpenProjectDetail: (project: Project) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
}

// Profile completion calculator
function getProfileCompletion(user: StudentProfile): { score: number; missing: string[] } {
  const checks = [
    { label: "Full name", done: Boolean(user.fullName?.trim()) },
    { label: "University", done: Boolean(user.university?.trim()) },
    { label: "Major", done: Boolean(user.major?.trim()) },
    { label: "Bio", done: Boolean(user.bio?.trim()) },
    { label: "Headline", done: Boolean(user.headline?.trim()) },
    { label: "Skills offered (≥2)", done: user.skillsOffered.length >= 2 },
    { label: "Skills seeking (≥1)", done: user.skillsSeeking.length >= 1 },
    { label: "GitHub URL", done: Boolean(user.githubUrl?.trim()) },
    { label: "LinkedIn URL", done: Boolean(user.linkedinUrl?.trim()) },
    { label: "Availability set", done: user.availabilityHoursPerWeek > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  return { score: Math.round((done / checks.length) * 100), missing };
}

export function Dashboard({
  currentUser,
  students,
  projects,
  requests,
  onNavigate,
  onOpenStudentDetail,
  onOpenProjectDetail,
  onAcceptRequest,
  onDeclineRequest,
}: DashboardProps) {
  const profileCompletion = getProfileCompletion(currentUser);

  // Incoming requests — requests addressed to current user
  const incomingRequests = requests.filter(
    (r) => r.receiverId === currentUser.id && r.status === "pending"
  );

  // Outgoing requests sent by current user
  const outgoingRequests = requests.filter(
    (r) => r.senderId === currentUser.id
  );

  // Top AI matches (strictly public profiles, excluding self)
  const topMatches = students
    .filter((s) => s.id !== currentUser.id && s.isPublic === true)
    .map((s) => ({ student: s, synergy: calculateStudentSynergy(currentUser, s) }))
    .sort((a, b) => b.synergy.overallScore - a.synergy.overallScore)
    .slice(0, 3);

  // Projects where user is creator
  const myProjects = projects.filter((p) => p.creatorId === currentUser.id);

  // Projects user has applied to (via accepted requests)
  const appliedProjectIds = outgoingRequests
    .filter((r) => r.projectId && r.status === "accepted")
    .map((r) => r.projectId!);

  const activeProjects = projects.filter(
    (p) => p.creatorId === currentUser.id || appliedProjectIds.includes(p.id)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Mission Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser.fullName.split(" ")[0]}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {currentUser.headline} · {currentUser.university}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="glow" size="sm" onClick={() => onNavigate("students")}>
            <Users className="w-4 h-4 mr-1.5" />
            Find Teammates
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onNavigate("profile")}
            className="border-slate-700 bg-navy-900">
            <Sliders className="w-4 h-4 mr-1.5" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile Score</span>
          </div>
          <div className="text-3xl font-black text-white">{profileCompletion.score}%</div>
          <div className="mt-2 h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${profileCompletion.score}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            {profileCompletion.score === 100 ? "Complete! 🎉" : `${10 - Math.round(profileCompletion.score / 10)} items left`}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-3xl font-black text-white">{incomingRequests.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">invitations to respond</p>
          {incomingRequests.length > 0 && (
            <button
              onClick={() => onNavigate("collab")}
              className="text-xs text-cyan-400 hover:underline mt-1 block"
            >
              View all →
            </button>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Projects</span>
          </div>
          <div className="text-3xl font-black text-white">{myProjects.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">projects posted</p>
          <button
            onClick={() => onNavigate("projects")}
            className="text-xs text-cyan-400 hover:underline mt-1 block"
          >
            Explore more →
          </button>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills</span>
          </div>
          <div className="text-3xl font-black text-white">
            {currentUser.skillsOffered.length + currentUser.skillsSeeking.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {currentUser.skillsOffered.length} offered · {currentUser.skillsSeeking.length} seeking
          </p>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletion.score < 100 && profileCompletion.missing.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Complete your profile to get better AI matches
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Missing: {profileCompletion.missing.slice(0, 3).join(", ")}
              {profileCompletion.missing.length > 3 && ` and ${profileCompletion.missing.length - 3} more`}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => onNavigate("profile")}
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shrink-0">
            Complete Profile
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Invitations */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-navy-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Pending Invitations
              {incomingRequests.length > 0 && (
                <span className="text-[10px] bg-cyan-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {incomingRequests.length}
                </span>
              )}
            </h3>
            <button
              onClick={() => onNavigate("collab")}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              View all →
            </button>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No pending invitations</p>
              <p className="text-xs mt-1">
                Start connecting by{" "}
                <button onClick={() => onNavigate("students")} className="text-cyan-400 hover:underline">
                  finding teammates
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomingRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-navy-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <Image src={req.senderAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={req.senderName} width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{req.senderName}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0">
                          {req.requestType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.2 rounded-full">
                          {req.synergyScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {req.pitchMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs px-2.5"
                      onClick={() => onDeclineRequest(req.id)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs px-2.5"
                      onClick={() => onAcceptRequest(req.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
              {incomingRequests.length > 3 && (
                <button
                  onClick={() => onNavigate("collab")}
                  className="w-full text-xs text-center text-slate-400 hover:text-cyan-300 py-2 transition-colors"
                >
                  +{incomingRequests.length - 3} more invitations in Collaboration Hub →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Top AI Matches */}
        <div className="rounded-2xl border border-slate-800 bg-navy-900/70 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Top AI Matches
            </h3>
            <button
              onClick={() => onNavigate("students")}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              See all →
            </button>
          </div>

          {topMatches.length > 0 ? (
            <div className="space-y-3">
              {topMatches.map(({ student, synergy }) => (
                <button
                  key={student.id}
                  onClick={() => onOpenStudentDetail(student, synergy)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-navy-950/60 hover:border-cyan-500/40 transition-all text-left"
                >
                  <Image src={student.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={student.fullName} width={32} height={32} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{student.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{student.university}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      synergy.overallScore >= 90
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : synergy.overallScore >= 80
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {synergy.overallScore}%
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              No public student matches available right now.
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 text-xs"
            onClick={() => onNavigate("ai-studio")}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            Generate Dream Team
          </Button>
        </div>
      </div>

      {/* My Projects / Active Teams */}
      <div className="rounded-2xl border border-slate-800 bg-navy-900/70 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Rocket className="w-4 h-4 text-indigo-400" />
            My Projects &amp; Active Teams
          </h3>
          <button
            onClick={() => onNavigate("projects")}
            className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Explore all →
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            <Rocket className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No active projects yet</p>
            <Button
              variant="glow"
              size="sm"
              className="mt-3"
              onClick={() => onNavigate("projects")}
            >
              Browse Projects
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.slice(0, 3).map((project) => (
              <button
                key={project.id}
                onClick={() => onOpenProjectDetail(project)}
                className="p-4 rounded-xl border border-slate-800 bg-navy-950/60 hover:border-cyan-500/40 transition-all text-left flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm line-clamp-1">{project.title}</h4>
                  <Badge
                    variant={project.status === "recruiting" ? "outline" : "secondary"}
                    className={`text-[10px] shrink-0 ${
                      project.status === "recruiting"
                        ? "border-cyan-500/40 text-cyan-300"
                        : "border-slate-700"
                    }`}
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{project.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    {project.currentTeamSize}/{project.maxTeamSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {project.weeklyHoursRequired}h/wk
                  </span>
                  {project.creatorId === currentUser.id && (
                    <span className="ml-auto text-[10px] text-emerald-400 font-semibold">Creator</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Discover\nTeammates", tab: "students", color: "text-cyan-400" },
          { icon: Rocket, label: "Browse\nProjects", tab: "projects", color: "text-indigo-400" },
          { icon: Sparkles, label: "AI Dream\nTeam Studio", tab: "ai-studio", color: "text-purple-400" },
          { icon: Sliders, label: "Edit Skill\nProfile", tab: "profile", color: "text-emerald-400" },
        ].map(({ icon: Icon, label, tab, color }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className="p-4 rounded-2xl border border-slate-800 bg-navy-900/70 hover:border-slate-700 hover:bg-navy-850 transition-all text-center group"
          >
            <Icon className={`w-6 h-6 mx-auto mb-2 ${color} group-hover:scale-110 transition-transform`} />
            <span className="text-xs font-semibold text-slate-300 whitespace-pre-line leading-tight">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
