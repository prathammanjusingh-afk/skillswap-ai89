"use client";

import React, { useState } from "react";
import { StudentProfile, SkillCategory, SkillProficiency, WorkStyle } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getCategoryBadgeColor } from "@/lib/utils";
import {
  Sparkles,
  Clock,
  GitBranch,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sliders,
} from "lucide-react";

interface SkillProfileEditorProps {
  currentUser: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
}

export function SkillProfileEditor({
  currentUser,
  onUpdateProfile,
}: SkillProfileEditorProps) {
  const [profile, setProfile] = useState<StudentProfile>(currentUser);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>("frontend");
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>("intermediate");
  const [newSkillTargetType, setNewSkillTargetType] = useState<"offered" | "seeking">("offered");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if persona changed externally
  React.useEffect(() => {
    setProfile(currentUser);
  }, [currentUser]);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      type: newSkillTargetType,
    };

    if (newSkillTargetType === "offered") {
      setProfile({
        ...profile,
        skillsOffered: [...profile.skillsOffered, newSkill],
      });
    } else {
      setProfile({
        ...profile,
        skillsSeeking: [...profile.skillsSeeking, newSkill],
      });
    }

    setNewSkillName("");
  };

  const handleRemoveSkill = (skillName: string, type: "offered" | "seeking") => {
    if (type === "offered") {
      setProfile({
        ...profile,
        skillsOffered: profile.skillsOffered.filter((s) => s.name !== skillName),
      });
    } else {
      setProfile({
        ...profile,
        skillsSeeking: profile.skillsSeeking.filter((s) => s.name !== skillName),
      });
    }
  };

  const handleSave = () => {
    onUpdateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-navy-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            Skill Identity & Match Parameters
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Customize What You Bring & What You Need
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Updating your offered skills and seeking criteria automatically recalibrates AI match scores across the entire student roster.
          </p>
        </div>

        <Button
          variant={savedSuccess ? "secondary" : "glow"}
          size="sm"
          onClick={handleSave}
          className="self-start sm:self-auto shrink-0"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" />
              Profile Updated!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              Save Match Profile
            </>
          )}
        </Button>
      </div>

      <div className="pt-6 space-y-6">
        {/* Availability & Work Rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-navy-950/70 border border-slate-800">
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Weekly Availability:
              </span>
              <span className="font-bold text-cyan-300 text-sm">
                {profile.availabilityHoursPerWeek} hrs/week
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={profile.availabilityHoursPerWeek}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  availabilityHoursPerWeek: Number(e.target.value),
                })
              }
              className="w-full accent-cyan-400"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              Matched with peers looking for similar weekly commitment windows.
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5 mb-2">
              <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
              Preferred Collaboration Style:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["async", "hybrid", "sync_intensive"] as WorkStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() =>
                    setProfile({ ...profile, preferredWorkStyle: style })
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    profile.preferredWorkStyle === style
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md"
                      : "bg-navy-900 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {style.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Skill Quick Form */}
        <div className="p-4 rounded-2xl bg-navy-950/70 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Add New Skill Tag
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Skill name (e.g. PyTorch, Rust, GraphQL)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-200 text-xs focus:outline-none"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="ai_ml">AI & ML</option>
                <option value="design">Design</option>
                <option value="cloud_devops">DevOps & Cloud</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <select
                value={newSkillTargetType}
                onChange={(e) =>
                  setNewSkillTargetType(e.target.value as "offered" | "seeking")
                }
                className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-200 text-xs focus:outline-none"
              >
                <option value="offered">Skill I Offer</option>
                <option value="seeking">Skill I Seek</option>
              </select>
            </div>
            <div>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddSkill}
                disabled={!newSkillName.trim()}
                className="w-full h-9 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Skills Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offered */}
          <div className="rounded-2xl border border-cyan-500/25 bg-navy-950/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Skills You Offer ({profile.skillsOffered.length})
              </span>
            </div>
            <div className="space-y-2">
              {profile.skillsOffered.map((sk) => (
                <div
                  key={sk.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-navy-900/80 border border-slate-800 text-xs"
                >
                  <span className={`font-medium px-2 py-0.5 rounded ${getCategoryBadgeColor(sk.category)}`}>
                    {sk.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 capitalize">
                      {sk.proficiency}
                    </span>
                    <button
                      onClick={() => handleRemoveSkill(sk.name, "offered")}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seeking */}
          <div className="rounded-2xl border border-purple-500/25 bg-navy-950/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Skills You Need in Teammates ({profile.skillsSeeking.length})
              </span>
            </div>
            <div className="space-y-2">
              {profile.skillsSeeking.map((sk) => (
                <div
                  key={sk.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-navy-900/80 border border-slate-800 text-xs"
                >
                  <span className="font-medium px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {sk.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 capitalize">
                      {sk.proficiency}
                    </span>
                    <button
                      onClick={() => handleRemoveSkill(sk.name, "seeking")}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
