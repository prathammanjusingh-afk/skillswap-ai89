"use client";

import React, { useState } from "react";
import { Project, ProjectRole, StudentProfile, ProjectType, ProjectStage } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Rocket, Sparkles } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onCreateProject: (newProject: Project) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  currentUser,
  onCreateProject,
}: CreateProjectModalProps) {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Artificial Intelligence");
  const [projectType, setProjectType] = useState<ProjectType>("hackathon");
  const [stage, setStage] = useState<ProjectStage>("ideation");
  const [targetEvent, setTargetEvent] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [tagsInput, setTagsInput] = useState("Next.js, TypeScript, AI");

  const [roles, setRoles] = useState<{ title: string; requiredSkills: string }[]>([
    { title: "Lead AI/ML Engineer", requiredSkills: "PyTorch, FastAPI, Python" },
    { title: "Product Designer (UI/UX)", requiredSkills: "Figma, Design Systems" },
  ]);

  const handleAddRole = () => {
    setRoles([...roles, { title: "", requiredSkills: "" }]);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleUpdateRole = (index: number, field: "title" | "requiredSkills", val: string) => {
    const updated = [...roles];
    updated[index][field] = val;
    setRoles(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const formattedRoles: ProjectRole[] = roles
      .filter((r) => r.title.trim())
      .map((r, i) => ({
        id: `role-${Date.now()}-${i}`,
        title: r.title.trim(),
        description: `Looking for a student collaborator proficient in ${r.requiredSkills}`,
        requiredSkills: r.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        isFilled: false,
      }));

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      creatorAvatar: currentUser.avatarUrl,
      creatorUniversity: currentUser.university,
      title,
      tagline: tagline || "Building the next big thing with complementary student innovators.",
      description,
      category,
      projectType,
      stage,
      targetEvent: targetEvent || undefined,
      weeklyHoursRequired: weeklyHours,
      tags,
      status: "recruiting",
      currentTeamSize: 1,
      maxTeamSize: 1 + formattedRoles.length,
      createdAt: new Date().toISOString(),
      openRoles: formattedRoles,
    };

    onCreateProject(newProj);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2.5">
          <Rocket className="w-5 h-5 text-purple-400" />
          <span>Launch a New Project &amp; Build Your Team</span>
        </div>
      }
      description="Define your vision, target milestones, and the complementary roles your project needs."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold text-gray-300 block mb-1">
            Project Title *
          </label>
          <Input
            placeholder="e.g. NeuroScribe AI, Vigil Code Auditor, CampusPulse"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="font-semibold text-gray-300 block mb-1">
            Elevator Pitch / Tagline *
          </label>
          <Input
            placeholder="One-line hook summarizing what you are building"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="h-10 bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-gray-300 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Developer Tools">Developer Tools</option>
              <option value="Fintech & Web3">Fintech & Web3</option>
              <option value="EdTech & Campus">EdTech & Campus</option>
              <option value="HealthTech">HealthTech</option>
              <option value="Climate Tech">Climate Tech</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-300 block mb-1">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full h-10 rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-gray-100 text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="hackathon">Hackathon</option>
              <option value="startup_mvp">Startup MVP</option>
              <option value="capstone">Senior Capstone</option>
              <option value="open_source">Open Source</option>
              <option value="research">Academic Research</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-300 block mb-1">
              Target Milestone / Event
            </label>
            <Input
              placeholder="e.g. PennApps 2026, YC W27"
              value={targetEvent}
              onChange={(e) => setTargetEvent(e.target.value)}
              className="h-10 bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-gray-300 block mb-1">
            Detailed Project Vision &amp; Architecture *
          </label>
          <Textarea
            placeholder="Explain what problem this solves, current progress, and what you need collaborators to build..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-300 block mb-1">
              Weekly Hours Commitment ({weeklyHours} hrs/wk)
            </label>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-purple-500 mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-300 block mb-1">
              Tags / Keywords (comma separated)
            </label>
            <Input
              placeholder="Next.js, PyTorch, Supabase, Tailwind"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="h-10 bg-gray-950 border-gray-800 text-gray-200 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>

        {/* Roles needed */}
        <div className="pt-2 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Needed Roles &amp; Skills
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRole}
              className="h-7 text-xs rounded-full border-gray-800"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-purple-400" /> Add Role
            </Button>
          </div>

          <div className="space-y-2">
            {roles.map((role, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-950 border border-gray-800"
              >
                <div className="flex-1">
                  <Input
                    placeholder="Role Title (e.g. Lead ML Engineer)"
                    value={role.title}
                    onChange={(e) => handleUpdateRole(idx, "title", e.target.value)}
                    className="h-9 text-xs bg-gray-900 border-gray-800 rounded-lg"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Required Skills (e.g. PyTorch, Python)"
                    value={role.requiredSkills}
                    onChange={(e) => handleUpdateRole(idx, "requiredSkills", e.target.value)}
                    className="h-9 text-xs bg-gray-900 border-gray-800 rounded-lg"
                    required
                  />
                </div>
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(idx)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="purple" size="sm" className="rounded-full shadow-lg shadow-purple-600/30">
            <Rocket className="w-3.5 h-3.5 mr-1.5" />
            Publish Project &amp; Find Teammates
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProjectModal;
