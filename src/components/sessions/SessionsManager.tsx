"use client";

import React, { useState } from "react";
import { ExchangeSession, StudentProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";

interface SessionsManagerProps {
  sessions: ExchangeSession[];
  currentUser: StudentProfile;
  onUpdateSessionStatus: (sessionId: string, newStatus: ExchangeSession["status"]) => void;
  onNavigate: (tab: string) => void;
}

export function SessionsManager({
  sessions,
  currentUser,
  onUpdateSessionStatus,
  onNavigate,
}: SessionsManagerProps) {
  const [filter, setFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("scheduled");

  const filtered = sessions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const scheduledCount = sessions.filter((s) => s.status === "scheduled").length;
  const completedCount = sessions.filter((s) => s.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            1-on-1 Learning Schedule
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Skill Exchange Sessions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Coordinate, attend, and track completed peer learning workshops with fellow students.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Upcoming</span>
            <span className="text-xl font-bold text-cyan-300">{scheduledCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-center min-w-[90px]">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Completed</span>
            <span className="text-xl font-bold text-emerald-300">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["scheduled", "all", "completed", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
              filter === tab
                ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm"
                : "border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {tab}
            {tab === "scheduled" && scheduledCount > 0 && ` (${scheduledCount})`}
          </button>
        ))}
      </div>

      {/* Session Cards */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-800 bg-navy-900/40 p-6 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No {filter} sessions found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Skill exchange sessions are arranged directly with compatible student peers. Browse matching students and propose a session!
          </p>
          <Button
            variant="glow"
            size="sm"
            onClick={() => onNavigate("students")}
            className="mt-2"
          >
            <Users className="w-4 h-4 mr-1.5" />
            Discover Learning Partners
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((session) => {
            const sessionDate = new Date(session.scheduledAt);
            const dateStr = sessionDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const timeStr = sessionDate.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={session.id}
                className="p-5 rounded-2xl border border-slate-800 bg-navy-900/70 backdrop-blur-md flex flex-col justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={session.partnerAvatar}
                        alt={session.partnerName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {session.partnerName}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {session.partnerUniversity}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        session.status === "completed"
                          ? "success"
                          : session.status === "scheduled"
                          ? "indigo"
                          : "secondary"
                      }
                      className="capitalize text-[11px]"
                    >
                      {session.status}
                    </Badge>
                  </div>

                  {/* Skills Exchanged */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-navy-950/70 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-0.5">
                        You Learn
                      </span>
                      <span className="font-semibold text-white">
                        {session.skillToLearn}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-0.5">
                        You Teach
                      </span>
                      <span className="font-semibold text-white">
                        {session.skillToTeach}
                      </span>
                    </div>
                  </div>

                  {/* Date, Time & Meeting Type */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {dateStr}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      {timeStr} ({session.durationMinutes}m)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      {session.meetingType === "online" ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-emerald-400" /> Online Call
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-amber-400" /> In-Person
                        </>
                      )}
                    </span>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-slate-400 mt-2.5 p-2 rounded-lg bg-navy-950/50 border border-slate-800/60 leading-relaxed">
                      &ldquo;{session.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {session.meetingLink && session.status === "scheduled" && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Meeting Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {session.status === "scheduled" && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs border-slate-700"
                        onClick={() => onUpdateSessionStatus(session.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => onUpdateSessionStatus(session.id, "completed")}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                        Mark Done
                      </Button>
                    </div>
                  )}

                  {session.status === "completed" && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 ml-auto font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Exchange Verified
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
