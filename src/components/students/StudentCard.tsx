"use client";

import React from "react";
import { StudentProfile, SynergyBreakdown } from "@/types";
import { calculateStudentSynergy } from "@/lib/ai-matchmaker";
import { getCategoryBadgeColor } from "@/lib/utils";
import { SynergyScoreCard } from "@/components/ai/SynergyScoreCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Clock,
  Sparkles,
  ExternalLink,
  Send,
  CheckCircle2,
  GitBranch,
} from "lucide-react";

interface StudentCardProps {
  student: StudentProfile;
  currentUser: StudentProfile;
  onSelectStudent: (student: StudentProfile, synergy: SynergyBreakdown) => void;
  onRequestSwap: (student: StudentProfile, synergy: SynergyBreakdown) => void;
}

export function StudentCard({
  student,
  currentUser,
  onSelectStudent,
  onRequestSwap,
}: StudentCardProps) {
  const synergy = calculateStudentSynergy(currentUser, student);
  const isSelf = currentUser.id === student.id;

  return (
    <div className="group relative rounded-2xl border border-slate-800/80 bg-navy-900/70 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:bg-navy-850 hover:shadow-cyan-950/40 hover:shadow-2xl flex flex-col justify-between">
      {/* Top Banner & AI Synergy pill */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition-colors"
              />
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-navy-900"
                title="Active & Looking for Team"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                  {student.fullName}
                </h3>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-cyan-500/50 text-cyan-300">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[170px]">{student.university} &apos;{student.graduationYear % 100}</span>
              </p>
            </div>
          </div>

          {!isSelf && (
            <div title="AI Compatibility Score calculated based on your complementary skill profile">
              <SynergyScoreCard synergy={synergy} compact />
            </div>
          )}
        </div>

        {/* Headline */}
        <p className="text-xs text-slate-300 leading-snug line-clamp-2 mb-3 min-h-[32px]">
          {student.headline}
        </p>

        {/* Working Style & Hours */}
        <div className="flex items-center gap-2 mb-4 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 bg-navy-950/80 px-2 py-0.5 rounded border border-slate-800">
            <Clock className="w-3 h-3 text-cyan-400" />
            {student.availabilityHoursPerWeek} hrs/wk
          </span>
          <span className="inline-flex items-center gap-1 bg-navy-950/80 px-2 py-0.5 rounded border border-slate-800 capitalize">
            <GitBranch className="w-3 h-3 text-indigo-400" />
            {student.preferredWorkStyle}
          </span>
          <span className="text-slate-500 text-[10px] ml-auto">
            {student.timezone}
          </span>
        </div>

        {/* Skills Offered (What they bring) */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3 h-3" /> Skills Offered
            </span>
            <span className="text-[10px] font-normal text-slate-500">
              {student.skillsOffered.length} skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {student.skillsOffered.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getCategoryBadgeColor(
                  skill.category
                )}`}
              >
                {skill.name}
              </span>
            ))}
            {student.skillsOffered.length > 4 && (
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 self-center">
                +{student.skillsOffered.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Skills Seeking (What they need) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1 text-purple-400">
              <CheckCircle2 className="w-3 h-3" /> Looking For
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {student.skillsSeeking.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/25"
              >
                {skill.name}
              </span>
            ))}
            {student.skillsSeeking.length > 3 && (
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 self-center">
                +{student.skillsSeeking.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => onSelectStudent(student, synergy)}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          Synergy Details
        </Button>

        {!isSelf ? (
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onRequestSwap(student, synergy)}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Request Swap
          </Button>
        ) : (
          <span className="text-[11px] text-slate-500 italic py-1 px-2">
            Active Persona
          </span>
        )}
      </div>
    </div>
  );
}
