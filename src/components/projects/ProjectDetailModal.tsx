"use client";

import React, { useState } from "react";
import { Project, ProjectRole, ProjectStage, StudentProfile } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Edit3,
  Trash2,
  Save,
  X,
  Plus,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  currentUser: StudentProfile;
  preselectedRoleId?: string | null;
  onApply: (projectId: string, roleTitle: string, pitch: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => Promise<void> | void;
  onDeleteProject?: (projectId: string) => Promise<void> | void;
}

export function ProjectDetailModal({
  isOpen,
  onClose,
  project,
  currentUser,
  preselectedRoleId,
  onApply,
  onUpdateProject,
  onDeleteProject,
}: ProjectDetailModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [pitch, setPitch] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Creator edit mode states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    tagline: string;
    description: string;
    stage: ProjectStage;
    status: Project["status"];
    targetEvent: string;
    weeklyHoursRequired: number;
    repoUrl: string;
    demoUrl: string;
    tags: string;
    roles: ProjectRole[];
  }>({
    title: "",
    tagline: "",
    description: "",
    stage: "ideation",
    status: "recruiting",
    targetEvent: "",
    weeklyHoursRequired: 10,
    repoUrl: "",
    demoUrl: "",
    tags: "",
    roles: [],
  });

  // New role entry states inside edit mode
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleSkills, setNewRoleSkills] = useState("");

  React.useEffect(() => {
    if (preselectedRoleId && project) {
      const match = project.openRoles.find((r) => r.id === preselectedRoleId);
      if (match) setSelectedRole(match.title);
    } else if (project && project.openRoles.length > 0) {
      setSelectedRole(project.openRoles[0].title);
    }

    if (project) {
      setEditForm({
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        stage: project.stage,
        status: project.status || "recruiting",
        targetEvent: project.targetEvent || "",
        weeklyHoursRequired: project.weeklyHoursRequired || 10,
        repoUrl: project.repoUrl || "",
        demoUrl: project.demoUrl || "",
        tags: (project.tags || []).join(", "),
        roles: project.openRoles || [],
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
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

  const handleQuickStatusChange = async (newStatus: Project["status"]) => {
    if (!onUpdateProject) return;
    setIsSaving(true);
    try {
      await onUpdateProject(project.id, { status: newStatus });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRoleFilled = async (roleId: string) => {
    if (!onUpdateProject) return;
    const updatedRoles = project.openRoles.map((r) =>
      r.id === roleId ? { ...r, isFilled: !r.isFilled } : r
    );
    setIsSaving(true);
    try {
      await onUpdateProject(project.id, { openRoles: updatedRoles });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!onUpdateProject) return;
    setIsSaving(true);
    try {
      const parsedTags = editForm.tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      await onUpdateProject(project.id, {
        title: editForm.title.trim(),
        tagline: editForm.tagline.trim(),
        description: editForm.description.trim(),
        stage: editForm.stage,
        status: editForm.status,
        targetEvent: editForm.targetEvent.trim() || undefined,
        weeklyHoursRequired: Number(editForm.weeklyHoursRequired) || 10,
        repoUrl: editForm.repoUrl.trim() || undefined,
        demoUrl: editForm.demoUrl.trim() || undefined,
        tags: parsedTags,
        openRoles: editForm.roles,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRoleInEdit = () => {
    if (!newRoleTitle.trim()) return;
    const newRole: ProjectRole = {
      id: `role-${Date.now()}`,
      title: newRoleTitle.trim(),
      description: newRoleDesc.trim(),
      requiredSkills: newRoleSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isFilled: false,
    };
    setEditForm((prev) => ({
      ...prev,
      roles: [...prev.roles, newRole],
    }));
    setNewRoleTitle("");
    setNewRoleDesc("");
    setNewRoleSkills("");
  };

  const handleRemoveRoleInEdit = (roleId: string) => {
    setEditForm((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== roleId),
    }));
  };

  const handleDelete = async () => {
    if (!onDeleteProject) return;
    setIsDeleting(true);
    try {
      await onDeleteProject(project.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "recruiting":
        return <Badge variant="default" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/40">Recruiting</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/40">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/40">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center justify-between gap-4 w-full pr-6">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xl font-bold text-white">{project.title}</span>
              <Badge variant="indigo" className="text-xs">
                {project.stage.replace("_", " ")}
              </Badge>
              {getStatusBadge(project.status || "recruiting")}
              {isCreator && (
                <Badge variant="outline" className="text-xs border-purple-400 text-purple-300 bg-purple-500/10">
                  Project Lead (You)
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400">{project.tagline}</p>
          </div>

          {isCreator && !isEditing && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 border-slate-700 hover:border-cyan-400 hover:text-cyan-300"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Project
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Creator Management Quick Bar */}
        {isCreator && !isEditing && (
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-semibold text-purple-200 block">Lead Control Center</span>
                <span className="text-[11px] text-purple-300/80">Manage project lifecycle and position openings</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-[11px]">Lifecycle Status:</label>
              <select
                value={project.status || "recruiting"}
                onChange={(e) => handleQuickStatusChange(e.target.value as Project["status"])}
                disabled={isSaving}
                className="bg-navy-950 border border-slate-700 text-white rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="recruiting">Recruiting Teammates</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed / Shipped</option>
              </select>

              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs px-2.5 ml-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Are you sure you want to delete this project?</span>
            </div>
            <p className="text-[11px] text-rose-300/80">
              Deleting this project will permanently remove it from the marketplace and discard all associated applications.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT MODE FORM                                                  */}
        {/* ============================================================== */}
        {isEditing ? (
          <div className="space-y-4 p-4 rounded-xl bg-navy-950/60 border border-slate-800 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Project Specifications
              </h4>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Project Title *</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. NeuroScribe AI"
                  className="h-8 text-xs bg-navy-900"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">One-Line Tagline *</label>
                <Input
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  placeholder="Brief catchy summary"
                  className="h-8 text-xs bg-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold mb-1 block">Full Description *</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                placeholder="Detailed architecture, goals, and tech stack overview"
                className="text-xs bg-navy-900"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Project Stage</label>
                <select
                  value={editForm.stage}
                  onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as ProjectStage })}
                  className="w-full bg-navy-900 border border-slate-700 text-white rounded-md px-2.5 h-8 text-xs"
                >
                  <option value="ideation">Ideation</option>
                  <option value="prototype">Prototype</option>
                  <option value="in_progress">In Progress</option>
                  <option value="polishing">Polishing</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Project["status"] })}
                  className="w-full bg-navy-900 border border-slate-700 text-white rounded-md px-2.5 h-8 text-xs"
                >
                  <option value="recruiting">Recruiting</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Weekly Hours</label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={editForm.weeklyHoursRequired}
                  onChange={(e) => setEditForm({ ...editForm, weeklyHoursRequired: Number(e.target.value) })}
                  className="h-8 text-xs bg-navy-900"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Milestone / Event</label>
                <Input
                  value={editForm.targetEvent}
                  onChange={(e) => setEditForm({ ...editForm, targetEvent: e.target.value })}
                  placeholder="e.g. TreeHacks 2026"
                  className="h-8 text-xs bg-navy-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">GitHub Repository URL</label>
                <Input
                  value={editForm.repoUrl}
                  onChange={(e) => setEditForm({ ...editForm, repoUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="h-8 text-xs bg-navy-900"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">Live Demo / Pitch URL</label>
                <Input
                  value={editForm.demoUrl}
                  onChange={(e) => setEditForm({ ...editForm, demoUrl: e.target.value })}
                  placeholder="https://..."
                  className="h-8 text-xs bg-navy-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold mb-1 block">Tags (comma-separated)</label>
              <Input
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="PyTorch, Next.js, PostgreSQL"
                className="h-8 text-xs bg-navy-900"
              />
            </div>

            {/* Role Management in Edit Form */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px] block">
                Manage Project Roles ({editForm.roles.length})
              </label>

              <div className="space-y-2">
                {editForm.roles.map((r) => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{r.title}</span>
                        {r.isFilled ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Filled</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Open</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{r.description || "No description provided."}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {r.requiredSkills.map((sk, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.2 bg-navy-950 text-slate-300 rounded border border-slate-800">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-6 text-[11px] px-2"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            roles: editForm.roles.map((item) =>
                              item.id === r.id ? { ...item, isFilled: !item.isFilled } : item
                            ),
                          });
                        }}
                      >
                        {r.isFilled ? "Reopen" : "Mark Filled"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-6 text-[11px] px-2"
                        onClick={() => handleRemoveRoleInEdit(r.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Role inline */}
              <div className="p-3 rounded-lg bg-navy-900/60 border border-dashed border-slate-700 space-y-2">
                <span className="font-semibold text-slate-300 text-[11px] block">+ Add New Open Position</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Role Title (e.g. AI Engineer)"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    className="h-7 text-xs bg-navy-950"
                  />
                  <Input
                    placeholder="Required skills (e.g. PyTorch, CUDA)"
                    value={newRoleSkills}
                    onChange={(e) => setNewRoleSkills(e.target.value)}
                    className="h-7 text-xs bg-navy-950"
                  />
                  <Input
                    placeholder="Role description"
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    className="h-7 text-xs bg-navy-950"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-cyan-500/40 text-cyan-300"
                  onClick={handleAddRoleInEdit}
                  disabled={!newRoleTitle.trim()}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Position
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={handleSaveEdit}
                disabled={isSaving || !editForm.title.trim()}
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                Save Project Changes
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* NORMAL VIEW                                                     */
          /* ============================================================== */
          <>
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
                  {project.openRoles.filter((r) => r.isFilled).length + 1} / {project.openRoles.length + 1} members
                </span>
              </div>
            </div>

            {/* Links Bar if repo or demo present */}
            {(project.repoUrl || project.demoUrl) && (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-navy-950/50 border border-slate-800 text-xs">
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Source Repository
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Live Demo / Artifacts
                  </a>
                )}
              </div>
            )}

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
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Project Positions ({project.openRoles.length})
                </h4>
                {project.status === "completed" && (
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    ✓ Project is completed
                  </span>
                )}
              </div>

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
                        {role.isFilled ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            Filled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                            Open Position
                          </Badge>
                        )}
                      </div>

                      {/* Creator role toggle vs Member Apply button */}
                      {isCreator ? (
                        <button
                          type="button"
                          onClick={() => handleToggleRoleFilled(role.id)}
                          disabled={isSaving}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                            role.isFilled
                              ? "bg-navy-900 text-slate-300 border-slate-700 hover:border-slate-500"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                          }`}
                        >
                          {role.isFilled ? "Reopen Role" : "Mark as Filled"}
                        </button>
                      ) : (
                        !role.isFilled && project.status === "recruiting" && (
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
                        )
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {role.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[11px] text-slate-400 mr-1 self-center">
                        Required Skills:
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

            {/* Application Form for Non-Creators */}
            {!isCreator && project.status === "recruiting" && (
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
          </>
        )}
      </div>
    </Modal>
  );
}
