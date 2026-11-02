/*
  MarketplaceSection – Teammate and Skill Discovery Feed.
  Connected to real Supabase profiles, with strict profile privacy enforcement,
  skill tags, and AI synergy ranking.
*/

"use client";

import React from "react";
import { StudentProfile, SynergyBreakdown } from "@/types";
import { StudentCard } from "@/components/students/StudentCard";
import { filterPublicProfiles } from "@/lib/utils";
import { Users, Lock, Eye, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceSectionProps {
  students: StudentProfile[];
  currentUser: StudentProfile;
  onOpenStudentDetail: (student: StudentProfile, synergy: SynergyBreakdown) => void;
  onRequestSwap: (student: StudentProfile, synergy: SynergyBreakdown) => void;
  onNavigateToProfile?: () => void;
}

export function MarketplaceSection({
  students,
  currentUser,
  onOpenStudentDetail,
  onRequestSwap,
  onNavigateToProfile,
}: MarketplaceSectionProps) {
  // Ensure private profiles NEVER appear for anyone other than the user viewing their own preview
  const displayedStudents = filterPublicProfiles(students, currentUser.id);

  const isCurrentUserPrivate = !currentUser.isPublic;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Discover Teammates & Skill Swaps
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time reciprocal skill matching based on complementary capabilities and availability.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            {displayedStudents.length}
          </span>
          <span>discoverable {displayedStudents.length === 1 ? "profile" : "profiles"}</span>
        </div>
      </div>

      {/* Profile Privacy Status Banner for the viewing user */}
      {isCurrentUserPrivate && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200 block">
                Your profile is currently Private
              </span>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                You will not appear in other students&apos; marketplace searches or AI recommendations.
                Only collaborators you directly message or invite can see your details.
              </p>
            </div>
          </div>

          {onNavigateToProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToProfile}
              className="text-xs shrink-0 border-amber-500/30 text-amber-200 hover:bg-amber-500/20 self-start sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-amber-300" />
              Adjust Visibility
            </Button>
          )}
        </div>
      )}

      {/* Grid of Student Cards */}
      {displayedStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              currentUser={currentUser}
              onSelectStudent={onOpenStudentDetail}
              onRequestSwap={onRequestSwap}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-slate-800 bg-navy-900/40 text-slate-400 space-y-3">
          <AlertCircle className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
          <h3 className="text-base font-semibold text-slate-200">
            No public student profiles found
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No students currently match your search criteria, or all existing profiles are set to private.
            Try adjusting your search query, or publish your profile to lead the community!
          </p>
          {onNavigateToProfile && isCurrentUserPrivate && (
            <Button
              variant="glow"
              size="sm"
              onClick={onNavigateToProfile}
              className="mt-2 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Make Your Profile Public
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
