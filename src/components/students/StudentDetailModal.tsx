"use client";
import Image from "next/image";

import React, { useState } from "react";
import { StudentProfile, SynergyBreakdown } from "@/types";
import { Modal } from "@/components/ui/modal";
import { SynergyScoreCard } from "@/components/ai/SynergyScoreCard";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getCategoryBadgeColor } from "@/lib/utils";
import {
  GraduationCap,
  Clock,
  Sparkles,
  GitBranch,
  Send,
  Github,
  Linkedin,
  Globe,
  Award,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";
import { fetchReviews, ReviewItem } from "@/lib/supabase/data-service";

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  synergy: SynergyBreakdown | null;
  currentUser: StudentProfile;
  onSubmitRequest: (receiverId: string, pitchMessage: string) => void;
}

export function StudentDetailModal({
  isOpen,
  onClose,
  student,
  synergy,
  currentUser,
  onSubmitRequest,
}: StudentDetailModalProps) {
  const [pitch, setPitch] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  React.useEffect(() => {
    if (student?.id) {
      setLoadingReviews(true);
      fetchReviews(student.id)
        .then((res) => setReviews(res))
        .finally(() => setLoadingReviews(false));
    }
  }, [student?.id]);

  if (!student) return null;

  const isSelf = currentUser.id === student.id;

  const handleSend = () => {
    if (!pitch.trim()) return;
    onSubmitRequest(student.id, pitch);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setPitch("");
      onClose();
    }, 1400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-3">
          <Image src={student.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={student.fullName} width={64} height={64} className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500/50" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{student.fullName}</span>
              {isSelf && (
                <Badge variant="outline" className="text-xs border-cyan-400 text-cyan-300">
                  Your Profile
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-normal mt-0.5">
              <span>{student.university} &bull; Class of {student.graduationYear}</span>
              <span>&bull;</span>
              <span>{student.major}</span>
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* AI Synergy Breakdown Card if comparing with another student */}
        {!isSelf && synergy && (
          <div>
            <SynergyScoreCard synergy={synergy} />
          </div>
        )}

        {/* Bio & Badges */}
        <div className="rounded-xl bg-navy-950/70 border border-slate-800 p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            About & Working Style
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed mb-3">
            {student.bio}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-slate-700 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {student.availabilityHoursPerWeek} hrs/week committed
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-slate-700 text-slate-300 capitalize">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              {student.preferredWorkStyle} collaboration
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-900 border border-slate-700 text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {student.completedProjectsCount} projects shipped
            </span>
          </div>
        </div>

        {/* Verified Badges */}
        {student.badges.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1">Recognitions:</span>
            {student.badges.map((b, i) => (
              <Badge key={i} variant="secondary" className="text-xs border border-slate-700 bg-navy-800 text-slate-200">
                <Sparkles className="w-3 h-3 text-cyan-400 mr-1" />
                {b}
              </Badge>
            ))}
          </div>
        )}

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Offered */}
          <div className="rounded-xl border border-cyan-500/20 bg-navy-950/50 p-4">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Skills Offered
            </h4>
            <div className="space-y-2">
              {student.skillsOffered.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-navy-900/90 border border-slate-800"
                >
                  <span className={`font-medium px-2 py-0.5 rounded ${getCategoryBadgeColor(skill.category)}`}>
                    {skill.name}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize bg-navy-950 px-2 py-0.5 rounded border border-slate-800">
                    {skill.proficiency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Seeking */}
          <div className="rounded-xl border border-purple-500/20 bg-navy-950/50 p-4">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Skills Seeking in Teammates
            </h4>
            <div className="space-y-2">
              {student.skillsSeeking.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-navy-900/90 border border-slate-800"
                >
                  <span className="font-medium px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {skill.name}
                  </span>
                  <span className="text-[11px] text-slate-400 capitalize bg-navy-950 px-2 py-0.5 rounded border border-slate-800">
                    {skill.proficiency} desired
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 pt-2">
          {student.githubUrl && (
            <a
              href={student.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Github className="w-4 h-4" /> GitHub Profile
            </a>
          )}
          {student.linkedinUrl && (
            <a
              href={student.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Linkedin className="w-4 h-4 text-blue-400" /> LinkedIn
            </a>
          )}
          {student.portfolioUrl && (
            <a
              href={student.portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-400" /> Portfolio Site
            </a>
          )}
        </div>

        {/* Peer Reviews & Endorsements */}
        <div className="rounded-xl bg-navy-950/70 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Peer Reviews & Endorsements ({reviews.length})
            </h4>
            {reviews.length > 0 && (
              <span className="text-xs font-semibold text-amber-300">
                ⭐ {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0
              </span>
            )}
          </div>

          {loadingReviews ? (
            <p className="text-xs text-slate-500 italic py-2">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No peer reviews recorded yet. Completed sessions will feature feedback here.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-2.5 rounded-lg bg-navy-900/80 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{rev.reviewerName}</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action / Swap Request Section */}
        {!isSelf && (
          <div className="pt-4 border-t border-slate-800">
            {sentSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  Collaboration request successfully sent to {student.fullName}!
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block">
                  Propose a Skill Swap or Project Collaboration
                </label>
                <Textarea
                  placeholder={`Hi ${student.fullName}, I saw your background in ${student.skillsOffered[0]?.name || 'tech'} and would love to collaborate on...`}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  className="h-24"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    variant="glow"
                    size="sm"
                    onClick={handleSend}
                    disabled={!pitch.trim()}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Send Collaboration Pitch
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
