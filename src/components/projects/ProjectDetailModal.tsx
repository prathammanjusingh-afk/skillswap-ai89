"use client";

import React, { useState } from "react";
import { Project, StudentProfile } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Clock,
  Sparkles,
  Calendar,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Github,
  Send,
} from "lucide-react";

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  currentUser: StudentProfile;
  preselectedRoleId?: string | null;
  onApply: (projectId: string, roleTitle: string, pitch: string) => void;
}

export function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  currentUser,
  preselectedRoleId,
  onApply,
}: ProjectDetailModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pitch, setPitch] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  React.useEffect(() => {
    if (preselectedRoleId && project) {
      const match = project.openRoles.find((r) => r.id === preselectedRoleId);
      if (match) setSelectedRole(match.title);
    } else if (project && project.openRoles.length > 0) {
      setSelectedRole(project.openRoles[0].title);
    }
  }, [preselectedRoleId, project]);

  if (!project) return null;

  const isCreator = project.creatorId === currentUser.id;

  const handleApply = () => {
    if (!pitch.trim() || !selectedRole) return;
    onApply(project.id, selectedRole, pitch);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setPitch("");
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-white">{project.title}</span>
            <Badge variant="indigo" className="text-xs">
              {project.stage.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">{project.tagline}</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Project Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-navy-950/80 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Creator</span>
            <span className="font-semibold text-white">
              {project.creatorName} ({project.creatorUniversity})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Target Milestone</span>
            <span className="font-semibold text-cyan-300">
              {project.targetEvent || "Startup MVP Launch"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Team Commitment</span>
            <span className="font-semibold text-white">
              {project.weeklyHoursRequired} hrs/week
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Team Capacity</span>
            <span className="font-semibold text-indigo-300">
              {project.currentTeamSize} / {project.maxTeamSize} filled
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Project Overview & Architecture
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-navy-950/40 p-4 rounded-xl border border-slate-800/80">
            {project.description}
          </p>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
              Tech Stack & Focus Areas
            </span>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-navy-950 border border-slate-700 text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Open Roles */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Open Roles Needed
          </h4>
          <div className="space-y-2.5">
            {project.openRoles.map((role) => (
              <div
                key={role.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  selectedRole === role.title
                    ? "bg-navy-850 border-cyan-500/50 shadow-md shadow-cyan-950/30"
                    : "bg-navy-950/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-sm">
                      {role.title}
                    </span>
                  </div>
                  {!isCreator && (
                    <button
                      onClick={() => setSelectedRole(role.title)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                        selectedRole === role.title
                          ? "bg-cyan-500 text-white border-cyan-400"
                          : "bg-navy-900 text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {selectedRole === role.title ? "Selected" : "Select Role"}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {role.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-400 mr-1 self-center">
                    Skills:
                  </span>
                  {role.requiredSkills.map((sk, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form */}
        {!isCreator && (
          <div className="pt-4 border-t border-slate-800">
            {isSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Application successfully submitted for {selectedRole}!
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block">
                  Pitch Yourself for {selectedRole || "this Role"}
                </label>
                <Textarea
                  placeholder={`Hi ${project.creatorName}, I'd love to join ${project.title} as ${selectedRole}. Here is how my skills and experience can help...`}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="h-24"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApply}
                    disabled={!pitch.trim() || !selectedRole}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Apply with Skill Profile
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
