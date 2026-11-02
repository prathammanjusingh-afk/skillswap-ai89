"use client";

import React, { useState } from "react";
import { StudentProfile, Project } from "@/types";
import { generateDreamTeamRecommendation, calculateTeamSkillCoverage } from "@/lib/ai-matchmaker";
import { filterPublicProfiles } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Users,
  Layers,
  Zap,
  Shield,
  Palette,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Send,
} from "lucide-react";

interface TeamBuilderStudioProps {
  students: StudentProfile[];
  projects: Project[];
  currentUser: StudentProfile;
  onSendBatchInvites: (studentIds: string[], projectTitle: string) => void;
}

export function TeamBuilderStudio({
  students,
  projects,
  currentUser,
  onSendBatchInvites,
}: TeamBuilderStudioProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [invited, setInvited] = useState(false);

  const targetProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Candidates pool: self plus discoverable public students
  const pool = [
    currentUser,
    ...students.filter((s) => s.id !== currentUser.id && s.isPublic === true),
  ];
  const dreamTeam = generateDreamTeamRecommendation(targetProject, pool);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setInvited(false);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleInviteAll = () => {
    const studentIds = dreamTeam.suggestedCandidates.map((c) => c.student.id);
    onSendBatchInvites(studentIds, targetProject.title);
    setInvited(true);
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-navy-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            AI Dream Team Generator Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Synthesize Your Optimal Complementary Squad
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            SwapEngine AI analyzes student profiles, eliminating role redundancies and filling critical technical blindspots to assemble an elite hackathon or startup team.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <div className="min-w-[220px]">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Select Target Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="self-end h-10 mt-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isGenerating ? "animate-spin" : ""}`} />
            Re-run Matcher
          </Button>
        </div>
      </div>

      {/* Team Skill Coverage Dashboard */}
      <div className="relative z-10 rounded-2xl bg-navy-950/70 border border-slate-800 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Whole-Team Skill Coverage Radar
          </span>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Balanced Engineering Matrix
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Frontend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-sky-400" /> Frontend
              </span>
              <span className="font-bold text-sky-300">
                {dreamTeam.overallTeamCoverage.frontend}%
              </span>
            </div>
            <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.frontend}%` }}
              />
            </div>
          </div>

          {/* Backend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Backend & DB
              </span>
              <span className="font-bold text-emerald-300">
                {dreamTeam.overallTeamCoverage.backend}%
              </span>
            </div>
            <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.backend}%` }}
              />
            </div>
          </div>

          {/* AI / ML */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" /> AI & Models
              </span>
              <span className="font-bold text-purple-300">
                {dreamTeam.overallTeamCoverage.ai_ml}%
              </span>
            </div>
            <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.ai_ml}%` }}
              />
            </div>
          </div>

          {/* Design */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> UI/UX Design
              </span>
              <span className="font-bold text-pink-300">
                {dreamTeam.overallTeamCoverage.design}%
              </span>
            </div>
            <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.design}%` }}
              />
            </div>
          </div>

          {/* DevOps */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-amber-400" /> DevOps & Infra
              </span>
              <span className="font-bold text-amber-300">
                {dreamTeam.overallTeamCoverage.devops}%
              </span>
            </div>
            <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.devops}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Squad Members */}
      <div className="relative z-10 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Selected Roster & Role Assignments
          </h3>
          <span className="text-xs text-slate-400">
            {dreamTeam.suggestedCandidates.length} complementary members matched
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dreamTeam.suggestedCandidates.map((candidate, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-navy-950/60 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.student.avatarUrl}
                      alt={candidate.student.fullName}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {candidate.student.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {candidate.student.university} &bull; {candidate.student.major}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {candidate.synergyScore}% Fit
                  </span>
                </div>

                <div className="my-2.5 p-2 rounded-lg bg-navy-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block">Assigned Role:</span>
                  <span className="font-semibold text-cyan-300 text-xs">
                    {candidate.targetRole}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {candidate.justification}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                {candidate.student.skillsOffered.slice(0, 4).map((sk, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-navy-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400 text-center sm:text-left">
          Ready to form this team? Send invitations to all recommended members at once.
        </p>

        {invited ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Invitations Dispatched to All {dreamTeam.suggestedCandidates.length} Members!
          </div>
        ) : (
          <Button
            variant="glow"
            size="sm"
            onClick={handleInviteAll}
            className="w-full sm:w-auto"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Invite Entire Dream Team to Project
          </Button>
        )}
      </div>
    </div>
  );
}
