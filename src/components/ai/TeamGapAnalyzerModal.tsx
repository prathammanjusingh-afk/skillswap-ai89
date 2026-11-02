"use client";

import React, { useState } from "react";
import { Project, StudentProfile } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateProjectCandidateMatch, calculateTeamSkillCoverage } from "@/lib/ai-matchmaker";
import { filterPublicProfiles } from "@/lib/utils";
import {
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  ArrowRight,
} from "lucide-react";

interface TeamGapAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  allStudents: StudentProfile[];
  onInviteCandidate: (studentId: string, roleTitle: string, projectId: string) => void;
}

export function TeamGapAnalyzerModal({
  isOpen,
  onClose,
  project,
  allStudents,
  onInviteCandidate,
}: TeamGapAnalyzerModalProps) {
  const [invitedStudents, setInvitedStudents] = useState<Record<string, boolean>>({});

  if (!project) return null;

  // Find candidate matches for each open role (strictly publicly visible candidates, excluding project lead)
  const unfilledRoles = project.openRoles.filter((r) => !r.isFilled);
  const eligibleCandidates = allStudents.filter(
    (s) => s.isPublic === true && s.id !== project.creatorId
  );

  const roleRecommendations = unfilledRoles.map((role) => {
    const candidatesWithScore = eligibleCandidates
      .map((student) => {
        const match = calculateProjectCandidateMatch(project, role, student);
        return {
          student,
          ...match,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // top 3 candidates per role

    return {
      role,
      candidates: candidatesWithScore,
    };
  });

  const handleInvite = (studentId: string, roleTitle: string) => {
    onInviteCandidate(studentId, roleTitle, project.id);
    setInvitedStudents((prev) => ({ ...prev, [studentId]: true }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>AI Team Gap Analyzer & Matchmaker</span>
        </div>
      }
      description={`Analyzing skill distribution and gap filling for "${project.title}"`}
    >
      <div className="space-y-6">
        {/* Status Banner */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-white block text-sm">
              Current Roster: {project.currentTeamSize} of {project.maxTeamSize} filled
            </span>
            <p className="text-slate-400 mt-0.5">
              {unfilledRoles.length} complementary positions currently recruiting.
            </p>
          </div>
          <Badge variant="indigo" className="text-xs px-3 py-1">
            Active Recruitment
          </Badge>
        </div>

        {/* Roles & Candidate Recommendations */}
        <div className="space-y-6">
          {roleRecommendations.map(({ role, candidates }) => (
            <div
              key={role.id}
              className="rounded-xl border border-slate-800/80 bg-navy-950/50 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h4 className="font-bold text-white text-sm">{role.title}</h4>
                </div>
                <div className="flex gap-1.5">
                  {role.requiredSkills.map((sk, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-navy-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3">{role.description}</p>

              {/* Recommended Candidates */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider block">
                  Top Recommended Candidates for this Role:
                </span>
                {candidates.map(({ student, score, matchedRoleSkills, justification }) => {
                  const isInvited = invitedStudents[student.id];

                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-navy-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl}
                          alt={student.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {student.fullName}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              &bull; {student.university}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                              {score}% Fit
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">
                            {justification}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        {isInvited ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Invited
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="glow"
                            className="text-xs h-7 px-3"
                            onClick={() => handleInvite(student.id, role.title)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Invite
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
