"use client";

import React from "react";
import { StudentProfile, SynergyBreakdown } from "@/types";
import { calculateStudentSynergy } from "@/lib/ai-matchmaker";
import { getCategoryBadgeColor } from "@/lib/utils";
import { SynergyScoreCard } from "@/components/ai/SynergyScoreCard";
import { AvatarImage } from "@/components/ui/avatar-image";
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
    <div
      className="group relative rounded-2xl border border-gray-800 bg-gray-900/60 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-600/10 hover:shadow-2xl flex flex-col justify-between"
      style={{
        background:
          "radial-gradient(130.39% 130.39% at 51.31% -0.71%, rgba(31, 41, 55, 0.4) 0%, rgba(17, 24, 39, 0.6) 100%)",
      }}
    >
      {/* Top Banner & AI Synergy pill */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarImage
                src={student.avatarUrl}
                alt={student.fullName}
                size={54}
                className="border-2 border-gray-700 group-hover:border-purple-400 transition-colors"
              />
              <div
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-gray-900 z-10"
                title="Active & Looking for Team"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors">
                  {student.fullName}
                </h3>
                {isSelf && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-purple-500/50 text-purple-300">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
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
        <p className="text-xs text-gray-300 leading-snug line-clamp-2 mb-3 min-h-[32px]">
          {student.headline}
        </p>

        {/* Working Style & Hours */}
        <div className="flex items-center gap-2 mb-4 text-[11px] text-gray-400">
          <span className="inline-flex items-center gap-1 bg-gray-950/80 px-2 py-0.5 rounded-md border border-gray-800">
            <Clock className="w-3 h-3 text-purple-400" />
            {student.availabilityHoursPerWeek} hrs/wk
          </span>
          <span className="inline-flex items-center gap-1 bg-gray-950/80 px-2 py-0.5 rounded-md border border-gray-800 capitalize">
            <GitBranch className="w-3 h-3 text-violet-400" />
            {student.preferredWorkStyle}
          </span>
          <span className="text-gray-500 text-[10px] ml-auto">
            {student.timezone}
          </span>
        </div>

        {/* Skills Offered (What they bring) */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" /> Skills Offered
            </span>
            <span className="text-[10px] font-normal text-gray-500">
              {student.skillsOffered.length} skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {student.skillsOffered.slice(0, 4).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-600/15 text-purple-300 border border-purple-500/30"
              >
                {skill.name}
              </span>
            ))}
            {student.skillsOffered.length > 4 && (
              <span className="text-[10px] text-gray-400 px-1.5 py-0.5 self-center">
                +{student.skillsOffered.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Skills Seeking (What they need) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1 text-gray-400">
              <CheckCircle2 className="w-3 h-3 text-purple-400" /> Looking For
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {student.skillsSeeking.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700/60"
              >
                {skill.name}
              </span>
            ))}
            {student.skillsSeeking.length > 3 && (
              <span className="text-[10px] text-gray-400 px-1.5 py-0.5 self-center">
                +{student.skillsSeeking.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-3 border-t border-gray-800 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs rounded-full bg-gray-800 hover:bg-gray-700 border-gray-700"
          onClick={() => onSelectStudent(student, synergy)}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1" />
          Synergy Details
        </Button>

        {!isSelf ? (
          <Button
            variant="purple"
            size="sm"
            className="flex-1 text-xs rounded-full shadow-md shadow-purple-600/20"
            onClick={() => onRequestSwap(student, synergy)}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Request Swap
          </Button>
        ) : (
          <span className="text-[11px] text-gray-500 italic py-1 px-2">
            Active Persona
          </span>
        )}
      </div>
    </div>
  );
}

export default StudentCard;
