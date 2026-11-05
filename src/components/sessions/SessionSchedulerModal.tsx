"use client";
import Image from "next/image";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StudentProfile, ExchangeSession, LearningPreference } from "@/types";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface SessionSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  partner: StudentProfile | null;
  onScheduleSession: (newSession: ExchangeSession) => void;
}

export function SessionSchedulerModal({
  isOpen,
  onClose,
  currentUser,
  partner,
  onScheduleSession,
}: SessionSchedulerModalProps) {
  const [skillToLearn, setSkillToLearn] = useState("");
  const [skillToTeach, setSkillToTeach] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [duration, setDuration] = useState<number>(60);
  const [meetingType, setMeetingType] = useState<LearningPreference>("online");
  const [meetingLink, setMeetingLink] = useState("https://meet.google.com/new");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  // Set default skills based on partner & current user
  React.useEffect(() => {
    if (partner) {
      if (partner.skillsOffered.length > 0) {
        setSkillToLearn(partner.skillsOffered[0].name);
      }
      if (currentUser.skillsOffered.length > 0) {
        setSkillToTeach(currentUser.skillsOffered[0].name);
      }
      // Default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split("T")[0]);
    }
  }, [partner, currentUser]);

  if (!partner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillToLearn || !date || !time) return;

    const scheduledAt = `${date}T${time}:00`;

    const newSession: ExchangeSession = {
      id: `session-${Date.now()}`,
      partnerId: partner.id,
      partnerName: partner.fullName,
      partnerAvatar: partner.avatarUrl,
      partnerUniversity: partner.university,
      skillToLearn,
      skillToTeach: skillToTeach || "Reciprocal Project Review",
      scheduledAt,
      durationMinutes: duration,
      status: "scheduled",
      meetingType,
      meetingLink: meetingType === "online" ? meetingLink : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onScheduleSession(newSession);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <span>Schedule 1-on-1 Skill Exchange</span>
        </div>
      }
      description={`Set up a focused learning & mentoring session with ${partner.fullName}.`}
    >
      {success ? (
        <div className="p-6 text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-base">Session Scheduled!</h3>
          <p className="text-xs text-slate-300">
            Invitation added to your schedule. You will receive notifications before the session begins.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Partner Header */}
          <div className="p-3 rounded-xl bg-navy-950/70 border border-slate-800 flex items-center gap-3">
            <Image src={partner.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={partner.fullName} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
            <div>
              <span className="font-bold text-white text-sm">{partner.fullName}</span>
              <p className="text-[11px] text-slate-400">{partner.university} · {partner.headline}</p>
            </div>
          </div>

          {/* Skill Swap Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Skill You Will Learn *
              </label>
              <select
                value={skillToLearn}
                onChange={(e) => setSkillToLearn(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                {partner.skillsOffered.map((sk) => (
                  <option key={sk.name} value={sk.name}>
                    {sk.name} ({sk.proficiency})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Skill You Can Teach / Offer
              </label>
              <select
                value={skillToTeach}
                onChange={(e) => setSkillToTeach(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                {currentUser.skillsOffered.map((sk) => (
                  <option key={sk.name} value={sk.name}>
                    {sk.name} ({sk.proficiency})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Start Time *
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (Standard)</option>
                <option value={90}>90 mins (Deep Dive)</option>
              </select>
            </div>
          </div>

          {/* Meeting Format */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1.5">
              Meeting Location / Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMeetingType("online")}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition-all ${
                  meetingType === "online"
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md"
                    : "bg-navy-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Video className="w-3.5 h-3.5" /> Online Video Call
              </button>
              <button
                type="button"
                onClick={() => setMeetingType("in_person")}
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 font-medium transition-all ${
                  meetingType === "in_person"
                    ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md"
                    : "bg-navy-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Campus In-Person
              </button>
            </div>
          </div>

          {meetingType === "online" ? (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Video Meeting Link (Google Meet / Zoom / Discord)
              </label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Campus Location (Library, Lab, or Coffee Shop)
              </label>
              <Input
                placeholder="e.g. Main Library 3rd Floor Study Room B"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-300 block mb-1">
              Session Agenda / Focus Topics (Optional)
            </label>
            <Textarea
              placeholder="What specific questions or topics would you like to cover during this exchange?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Confirm & Schedule Session
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
