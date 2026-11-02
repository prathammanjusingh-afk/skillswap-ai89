"use client";

import React from "react";
import { Project, StudentProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Layers,
  Calendar,
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
  currentUser: StudentProfile;
  onSelectProject: (project: Project) => void;
  onApplyRole: (project: Project, roleId: string) => void;
  onOpenGapAnalyzer: (project: Project) => void;
}

export function ProjectCard({
  project,
  currentUser,
  onSelectProject,
  onApplyRole,
  onOpenGapAnalyzer,
}: ProjectCardProps) {
  // Check if current user is qualified for any open role
  const userSkillNames = currentUser.skillsOffered.map((s) => s.name.toLowerCase());
  
  const roleMatches = project.openRoles.map((role) => {
    const matched = role.requiredSkills.filter((req) =>
      userSkillNames.some((u) => u === req.toLowerCase() || u.includes(req.toLowerCase()))
    );
    const fitRatio = role.requiredSkills.length > 0 ? matched.length / role.requiredSkills.length : 0;
    return {
      role,
      fitScore: Math.round(fitRatio * 100),
      isGoodFit: fitRatio >= 0.5,
      matched,
    };
  });

  const bestRoleMatch = roleMatches.reduce(
    (best, curr) => (curr.fitScore > best.fitScore ? curr : best),
    roleMatches[0]
  );

  const isCreator = project.creatorId === currentUser.id;

  return (
    <div className="group rounded-2xl border border-slate-800/80 bg-navy-900/70 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:bg-navy-850 hover:shadow-cyan-950/40 flex flex-col justify-between">
      <div>
        {/* Header Tags: Event, Category, Stage, Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {project.targetEvent && (
              <Badge variant="indigo" className="text-[11px] font-semibold py-0.5">
                <Calendar className="w-3 h-3 mr-1" />
                {project.targetEvent}
              </Badge>
            )}
            <Badge variant="secondary" className="text-[11px] capitalize border-slate-700 bg-navy-950">
              {project.category}
            </Badge>
            {project.status === "recruiting" && (
              <Badge variant="default" className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40 py-0.5">
                Recruiting
              </Badge>
            )}
            {project.status === "in_progress" && (
              <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40 py-0.5">
                In Progress
              </Badge>
            )}
            {project.status === "completed" && (
              <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40 py-0.5">
                Completed
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isCreator && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                You
              </span>
            )}
            <Badge
              variant="outline"
              className="text-[11px] capitalize border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
            >
              {project.stage.replace("_", " ")}
            </Badge>
          </div>
        </div>

        {/* Project Title & Tagline */}
        <h3
          onClick={() => onSelectProject(project)}
          className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1 mb-1"
        >
          {project.title}
        </h3>
        <p className="text-xs text-slate-300 font-medium line-clamp-2 mb-4 leading-relaxed">
          {project.tagline}
        </p>

        {/* Creator Info & Team Size */}
        <div className="flex items-center justify-between text-xs text-slate-400 p-2.5 rounded-xl bg-navy-950/70 border border-slate-800/70 mb-4">
          <div className="flex items-center gap-2">
            <img
              src={project.creatorAvatar}
              alt={project.creatorName}
              className="w-6 h-6 rounded-full object-cover border border-slate-700"
            />
            <span className="truncate max-w-[130px] font-medium text-slate-200">
              {project.creatorName}
            </span>
            <span className="text-slate-500 hidden sm:inline">&bull; {project.creatorUniversity}</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              {project.currentTeamSize}/{project.maxTeamSize}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {project.weeklyHoursRequired}h/wk
            </span>
          </div>
        </div>

        {/* AI Role Compatibility Alert if user has high fit */}
        {!isCreator && bestRoleMatch && bestRoleMatch.fitScore >= 50 && (
          <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/40 border border-cyan-500/30 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
              <div>
                <span className="font-semibold text-cyan-300">
                  {bestRoleMatch.fitScore}% Match for {bestRoleMatch.role.title}
                </span>
                <p className="text-[11px] text-slate-400">
                  You bring {bestRoleMatch.matched.join(", ")}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="default"
              className="text-[11px] h-7 px-2.5 shrink-0"
              onClick={() => onApplyRole(project, bestRoleMatch.role.id)}
            >
              Apply
            </Button>
          </div>
        )}

        {/* Open Roles Needed */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-cyan-400" /> Open Positions (
              {project.openRoles.filter((r) => !r.isFilled).length})
            </span>
          </div>
          <div className="space-y-1.5">
            {project.openRoles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-2 rounded-lg bg-navy-950/50 border border-slate-800/80 text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200 block">
                    {role.title}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {role.requiredSkills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-400 bg-navy-900 px-1.5 py-0.5 rounded border border-slate-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {!isCreator && !role.isFilled && (project.status === "recruiting" || !project.status) && (
                  <button
                    onClick={() => onApplyRole(project, role.id)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 ml-2 px-2 py-1 rounded hover:bg-cyan-950/40 transition-colors shrink-0"
                  >
                    Apply
                  </button>
                )}
                {role.isFilled && (
                  <span className="text-[10px] text-emerald-400 font-semibold ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                    Filled
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex-1"
          onClick={() => onOpenGapAnalyzer(project)}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-1" />
          AI Gap Analysis
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="text-xs flex-1"
          onClick={() => onSelectProject(project)}
        >
          Details
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
