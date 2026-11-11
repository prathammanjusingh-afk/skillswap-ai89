"use client";
import Image from "next/image";

import React, { useState } from "react";
import { StudentProfile, Project } from "@/types";
import { generateDreamTeamRecommendation, calculateTeamSkillCoverage } from "@/lib/ai-matchmaker";
import { filterPublicProfiles } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  onNavigateToProjects?: () => void;
  onCreateProject?: () => void;
}

export function TeamBuilderStudio({
  students,
  projects = [],
  currentUser,
  onSendBatchInvites,
  onNavigateToProjects,
  onCreateProject,
}: TeamBuilderStudioProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [invited, setInvited] = useState(false);

  // Sync selectedProjectId if project list changes
  React.useEffect(() => {
    if (projects.length > 0 && (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const targetProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // Candidates pool: self plus discoverable public students
  const pool = [
    currentUser,
    ...(students || []).filter((s) => s.id !== currentUser.id && s.isPublic === true),
  ];
  const dreamTeam = targetProject
    ? generateDreamTeamRecommendation(targetProject, pool)
    : {
        projectId: "",
        suggestedCandidates: [],
        overallTeamCoverage: { frontend: 0, backend: 0, ai_ml: 0, design: 0, devops: 0 },
      };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setInvited(false);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  const handleInviteAll = () => {
    if (!targetProject) return;
    const studentIds = dreamTeam.suggestedCandidates.map((c) => c.student.id);
    onSendBatchInvites(studentIds, targetProject.title);
    setInvited(true);
  };

  if (!targetProject || projects.length === 0) {
    return (
      <div
        className="rounded-3xl border border-gray-800 bg-gray-900/80 p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center space-y-4"
        style={{
          background:
            "radial-gradient(130.39% 130.39% at 51.31% -0.71%, #1F2937 0%, rgba(17, 24, 39, 0.95) 100%)",
        }}
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          AI Dream Team Generator Studio
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          No active projects are currently available for AI squad synthesis. Post a new project or create open roles to automatically match complementary peer builders!
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          {onCreateProject && (
            <Button
              variant="purple"
              size="sm"
              onClick={onCreateProject}
              className="rounded-full shadow-lg shadow-purple-600/30"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Post a New Project
            </Button>
          )}
          {onNavigateToProjects && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToProjects}
              className="rounded-full border-gray-800 hover:bg-gray-800"
            >
              Explore Projects
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl border border-gray-800 bg-gray-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
      style={{
        background:
          "radial-gradient(130.39% 130.39% at 51.31% -0.71%, #1F2937 0%, rgba(17, 24, 39, 0.95) 100%)",
      }}
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-400" />
            AI Dream Team Generator Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Synthesize Your Optimal Complementary Squad
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl leading-relaxed">
            SwapEngine AI analyzes student profiles, eliminating role redundancies and filling critical technical blindspots to assemble an elite hackathon or startup team.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-3">
          <div className="min-w-[220px]">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Select Target Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
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
            className="self-end h-10 mt-auto rounded-xl border-gray-800 hover:bg-gray-800"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 text-purple-400 ${isGenerating ? "animate-spin" : ""}`} />
            Re-run Matcher
          </Button>
        </div>
      </div>

      {/* Team Skill Coverage Dashboard */}
      <div className="relative z-10 rounded-2xl bg-gray-950 border border-gray-800 p-5 mb-8 shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Whole-Team Skill Coverage Radar
          </span>
          <span className="text-xs text-purple-300 font-semibold bg-purple-600/15 px-3 py-0.5 rounded-full border border-purple-500/30">
            Balanced Engineering Matrix
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Frontend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-purple-400" /> Frontend
              </span>
              <span className="font-bold text-purple-300">
                {dreamTeam.overallTeamCoverage.frontend}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.frontend}%` }}
              />
            </div>
          </div>

          {/* Backend */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Backend &amp; DB
              </span>
              <span className="font-bold text-emerald-300">
                {dreamTeam.overallTeamCoverage.backend}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.backend}%` }}
              />
            </div>
          </div>

          {/* AI / ML */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-violet-400" /> AI &amp; Models
              </span>
              <span className="font-bold text-violet-300">
                {dreamTeam.overallTeamCoverage.ai_ml}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.ai_ml}%` }}
              />
            </div>
          </div>

          {/* Design */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> UI/UX Design
              </span>
              <span className="font-bold text-pink-300">
                {dreamTeam.overallTeamCoverage.design}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-700"
                style={{ width: `${dreamTeam.overallTeamCoverage.design}%` }}
              />
            </div>
          </div>

          {/* DevOps */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-amber-400" /> DevOps &amp; Infra
              </span>
              <span className="font-bold text-amber-300">
                {dreamTeam.overallTeamCoverage.devops}%
              </span>
            </div>
            <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden">
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
            <Users className="w-4 h-4 text-purple-400" /> Selected Roster &amp; Role Assignments
          </h3>
          <span className="text-xs text-gray-400">
            {dreamTeam.suggestedCandidates.length} complementary members matched
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dreamTeam.suggestedCandidates.map((candidate, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-gray-800 bg-gray-950 hover:border-purple-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <Image
                      src={candidate.student.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={candidate.student.fullName}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover border border-purple-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {candidate.student.fullName}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {candidate.student.university} &bull; {candidate.student.major}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30">
                    {candidate.synergyScore}% Fit
                  </span>
                </div>

                <div className="my-2.5 p-2 rounded-xl bg-gray-900 border border-gray-800 text-xs">
                  <span className="text-gray-400 text-[11px] block">Assigned Role:</span>
                  <span className="font-semibold text-purple-300 text-xs">
                    {candidate.targetRole}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {candidate.justification}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
                {candidate.student.skillsOffered.slice(0, 4).map((sk, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-purple-600/15 text-purple-300 border border-purple-500/25 px-2 py-0.5 rounded-md"
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
      <div className="relative z-10 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400 text-center sm:text-left">
          Ready to form this team? Send invitations to all recommended members at once.
        </p>

        {invited ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Invitations Dispatched to All {dreamTeam.suggestedCandidates.length} Members!
          </div>
        ) : (
          <Button
            variant="purple"
            size="sm"
            onClick={handleInviteAll}
            className="w-full sm:w-auto rounded-full shadow-lg shadow-purple-600/30"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Invite Entire Dream Team to Project
          </Button>
        )}
      </div>
    </div>
  );
}

export default TeamBuilderStudio;
