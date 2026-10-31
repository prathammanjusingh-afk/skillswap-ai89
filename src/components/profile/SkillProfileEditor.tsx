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
  User,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";

interface SkillProfileEditorProps {
  currentUser: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
}

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "ai_ml", label: "AI & ML" },
  { value: "design", label: "Design" },
  { value: "cloud_devops", label: "DevOps & Cloud" },
  { value: "mobile", label: "Mobile" },
  { value: "hardware_iot", label: "Hardware & IoT" },
  { value: "product_management", label: "Product Management" },
];

export function SkillProfileEditor({
  currentUser,
  onUpdateProfile,
}: SkillProfileEditorProps) {
  const [profile, setProfile] = useState<StudentProfile>(currentUser);
  const [activeSection, setActiveSection] = useState<"identity" | "skills" | "availability">("identity");
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
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const sectionTabs = [
    { id: "identity" as const, label: "Identity & Bio", icon: User },
    { id: "skills" as const, label: "Skills Matrix", icon: Sparkles },
    { id: "availability" as const, label: "Availability", icon: Clock },
  ];

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-navy-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            Skill Identity &amp; Match Parameters
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Edit Your Profile
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Changes automatically recalibrate AI match scores across the entire student roster.
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
              Profile Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mt-6 mb-6 p-1 bg-navy-950 rounded-xl border border-slate-800">
        {sectionTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeSection === id
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon className="w-3.5 h-3.5 hidden sm:block" />
            {label}
          </button>
        ))}
      </div>

      {/* Section: Identity & Bio */}
      {activeSection === "identity" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Your full name"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Headline</label>
              <Input
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                placeholder="e.g. Full-Stack Dev & AI Enthusiast @ MIT"
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">University</label>
              <Input
                value={profile.university}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                placeholder="e.g. Stanford University"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Major</label>
              <Input
                value={profile.major}
                onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                placeholder="e.g. Computer Science"
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Graduation Year</label>
              <Input
                type="number"
                value={profile.graduationYear}
                onChange={(e) => setProfile({ ...profile, graduationYear: Number(e.target.value) })}
                placeholder="2026"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Timezone</label>
              <Input
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                placeholder="e.g. PST (UTC-8)"
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell other students about yourself, your interests, and what kind of projects you want to work on..."
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-navy-950 px-3 py-2 text-slate-100 text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-navy-950/70 border border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Github className="w-3.5 h-3.5" />
                GitHub URL
              </label>
              <Input
                value={profile.githubUrl || ""}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                placeholder="https://github.com/username"
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                LinkedIn URL
              </label>
              <Input
                value={profile.linkedinUrl || ""}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Portfolio URL
              </label>
              <Input
                value={profile.portfolioUrl || ""}
                onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                placeholder="https://yourportfolio.dev"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Section: Skills Matrix */}
      {activeSection === "skills" && (
        <div className="space-y-6">
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
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  className="text-xs h-9"
                />
              </div>
              <div>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                  className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={newSkillTargetType}
                  onChange={(e) =>
                    setNewSkillTargetType(e.target.value as "offered" | "seeking")
                  }
                  className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="offered">Skill I Offer</option>
                  <option value="seeking">Skill I Seek</option>
                </select>
              </div>
              <div>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value as SkillProficiency)}
                  className="w-full h-9 rounded-lg border border-slate-700 bg-navy-950 px-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddSkill}
              disabled={!newSkillName.trim()}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Skill Tag
            </Button>
          </div>

          {/* Skills Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offered */}
            <div className="rounded-2xl border border-cyan-500/25 bg-navy-950/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Skills You Offer ({profile.skillsOffered.length})
                </span>
              </div>
              {profile.skillsOffered.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No skills added yet. Add skills above to improve your match score.
                </p>
              ) : (
                <div className="space-y-2">
                  {profile.skillsOffered.map((sk) => (
                    <div
                      key={sk.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-navy-900/80 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-medium px-2 py-0.5 rounded border ${getCategoryBadgeColor(sk.category)}`}>
                          {sk.name}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{sk.proficiency}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(sk.name, "offered")}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seeking */}
            <div className="rounded-2xl border border-purple-500/25 bg-navy-950/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Skills You Need ({profile.skillsSeeking.length})
                </span>
              </div>
              {profile.skillsSeeking.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No sought skills yet. Add skills you&apos;re looking for in teammates.
                </p>
              ) : (
                <div className="space-y-2">
                  {profile.skillsSeeking.map((sk) => (
                    <div
                      key={sk.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-navy-900/80 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                          {sk.name}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">{sk.proficiency} desired</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSkill(sk.name, "seeking")}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section: Availability */}
      {activeSection === "availability" && (
        <div className="space-y-6 p-4 rounded-2xl bg-navy-950/70 border border-slate-800">
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
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>5h (light)</span>
              <span>20h (standard)</span>
              <span>40h (full-time)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Matched with peers looking for similar weekly commitment windows.
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5 mb-3">
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
                  className={`py-3 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    profile.preferredWorkStyle === style
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md"
                      : "bg-navy-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600"
                  }`}
                >
                  <span className="block text-base mb-1">
                    {style === "async" ? "🌐" : style === "hybrid" ? "⚖️" : "🤝"}
                  </span>
                  {style.replace("_", " ")}
                </button>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-slate-400 p-3 bg-navy-900/60 rounded-lg border border-slate-800">
              <strong className="text-slate-300">Async</strong> — Work independently, communicate via messages/PRs<br />
              <strong className="text-slate-300">Hybrid</strong> — Mix of async and regular sync calls<br />
              <strong className="text-slate-300">Sync-intensive</strong> — Daily standups, real-time pair programming
            </div>
          </div>
        </div>
      )}

      {/* Save button (bottom) */}
      <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
        <Button
          variant={savedSuccess ? "secondary" : "glow"}
          size="sm"
          onClick={handleSave}
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" />
              Profile Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              Save Match Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
