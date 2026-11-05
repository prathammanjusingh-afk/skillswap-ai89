"use client";
import Image from "next/image";

import React, { useState, useRef, useEffect } from "react";
import { CollaborationRequest, StudentProfile, Project, ProjectTask, ProjectChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  fetchProjectTasks,
  createProjectTaskInDb,
  updateProjectTaskStatusInDb,
  fetchProjectMessages,
  sendProjectMessageInDb,
} from "@/lib/supabase/data-service";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Send,
  Users,
  Kanban,
  CheckSquare,
  Square,
  Inbox,
  ShieldAlert,
  Plus,
  FolderKanban,
  Loader2,
} from "lucide-react";

interface CollabHubProps {
  requests: CollaborationRequest[];
  currentUser: StudentProfile;
  projects: Project[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onCancelPendingRequest?: (requestId: string) => void;
  onCancelAcceptedCollaboration?: (requestId: string) => void;
}

export function CollabHub({
  requests,
  currentUser,
  projects,
  onAcceptRequest,
  onDeclineRequest,
  onCancelPendingRequest,
  onCancelAcceptedCollaboration,
}: CollabHubProps) {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "workspace">("incoming");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "declined" | "cancelled">("all");

  // User's accessible projects: Lead or Accepted Contributor
  const userProjects = projects.filter((p) => {
    const isCreator = p.creatorId === currentUser.id;
    const isAcceptedMember = requests.some(
      (r) =>
        r.projectId === p.id &&
        r.status === "accepted" &&
        (r.senderId === currentUser.id || r.receiverId === currentUser.id)
    );
    return isCreator || isAcceptedMember;
  });

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (userProjects.length > 0 && (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(userProjects[0].id);
    } else if (userProjects.length === 0 && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [userProjects, projects, selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  const isCreator = selectedProject ? selectedProject.creatorId === currentUser.id : false;
  const isAcceptedMember = selectedProject
    ? requests.some(
        (r) =>
          r.projectId === selectedProject.id &&
          r.status === "accepted" &&
          (r.senderId === currentUser.id || r.receiverId === currentUser.id)
      )
    : false;
  const hasTeamAccess = isCreator || isAcceptedMember;

  // Team Room dynamic data
  const [projectTasks, setProjectTasks] = useState<ProjectTask[]>([]);
  const [projectMessages, setProjectMessages] = useState<ProjectChatMessage[]>([]);
  const [isLoadingTeamData, setIsLoadingTeamData] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch project tasks and messages
  useEffect(() => {
    if (!selectedProjectId || !hasTeamAccess) {
      setProjectTasks([]);
      setProjectMessages([]);
      return;
    }

    if (isSupabaseConfigured) {
      setIsLoadingTeamData(true);
      Promise.all([
        fetchProjectTasks(selectedProjectId),
        fetchProjectMessages(selectedProjectId),
      ])
        .then(([tasksData, msgsData]) => {
          setProjectTasks(tasksData);
          setProjectMessages(msgsData);
        })
        .catch((err) => {
          console.warn("[CollabHub] Error fetching team room data:", err);
        })
        .finally(() => {
          setIsLoadingTeamData(false);
        });
    } else {
      // Demo fallback when offline or demo persona
      setProjectTasks([
        {
          id: "task-1",
          projectId: selectedProjectId,
          title: "Design System Tokens & Dark Palette",
          done: true,
          assigneeName: currentUser.fullName,
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-2",
          projectId: selectedProjectId,
          title: "SwapEngine Compatibility Algorithm",
          done: true,
          assigneeName: "Priya Sharma",
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-3",
          projectId: selectedProjectId,
          title: "Supabase Schema & RLS Security Policies",
          done: true,
          assigneeName: currentUser.fullName,
          createdAt: new Date().toISOString(),
        },
        {
          id: "task-4",
          projectId: selectedProjectId,
          title: "Hackathon Pitch Slide Deck & Demo Video",
          done: false,
          assigneeName: "Team",
          createdAt: new Date().toISOString(),
        },
      ]);
      setProjectMessages([
        {
          id: "msg-1",
          projectId: selectedProjectId,
          senderId: "demo-user-1",
          senderName: "Priya Sharma",
          senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
          content: "Hey team! I deployed the PyTorch embedding pipeline on Modal. The cosine similarity response time is down to 42ms!",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "msg-2",
          projectId: selectedProjectId,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          senderAvatar: currentUser.avatarUrl,
          content: "Nice work Priya! I just finished the Next.js 14 App Router integration and hooked up the interactive radar charts.",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: "msg-3",
          projectId: selectedProjectId,
          senderId: "demo-user-2",
          senderName: "Marcus Chen",
          senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
          content: "PostgreSQL schemas and RLS policies are verified. We are ready to ship to Vercel for the hackathon demo!",
          createdAt: new Date(Date.now() - 900000).toISOString(),
        },
      ]);
    }
  }, [selectedProjectId, hasTeamAccess, currentUser.id, currentUser.fullName, currentUser.avatarUrl]);

  // Realtime subscription for project tasks & messages
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !selectedProjectId || !hasTeamAccess) return;

    const client = supabase;
    const channel = client
      .channel(`team-room-${selectedProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_tasks",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as any;
            setProjectTasks((prev) => {
              if (prev.some((t) => t.id === row.id)) return prev;
              return [
                ...prev,
                {
                  id: row.id,
                  projectId: row.project_id,
                  title: row.title,
                  description: row.description || undefined,
                  done: Boolean(row.done),
                  assigneeId: row.assignee_id || undefined,
                  assigneeName: row.assignee_name || undefined,
                  createdAt: row.created_at,
                },
              ];
            });
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as any;
            setProjectTasks((prev) =>
              prev.map((t) =>
                t.id === row.id
                  ? {
                      ...t,
                      title: row.title,
                      description: row.description || undefined,
                      done: Boolean(row.done),
                      assigneeId: row.assignee_id || undefined,
                      assigneeName: row.assignee_name || undefined,
                    }
                  : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as any;
            setProjectTasks((prev) => prev.filter((t) => t.id !== oldRow.id));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row) {
            setProjectMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [
                ...prev,
                {
                  id: row.id,
                  projectId: row.project_id,
                  senderId: row.sender_id,
                  senderName: row.sender_name || "Team Member",
                  senderAvatar:
                    row.sender_avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                  content: row.content,
                  createdAt: row.created_at,
                },
              ];
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [selectedProjectId, hasTeamAccess]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [projectMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;

    const content = newMessage.trim();
    setNewMessage("");

    if (isSupabaseConfigured) {
      const res = await sendProjectMessageInDb({
        projectId: selectedProjectId,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl,
        content,
      });
      if (res.success && res.data) {
        setProjectMessages((prev) => {
          if (prev.some((m) => m.id === res.data!.id)) return prev;
          return [...prev, res.data!];
        });
      }
    } else {
      const msg: ProjectChatMessage = {
        id: `msg-${Date.now()}`,
        projectId: selectedProjectId,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
      };
      setProjectMessages((prev) => [...prev, msg]);
    }
  };

  const handleToggleTask = async (taskId: string, currentDone: boolean) => {
    setProjectTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !currentDone } : t))
    );

    if (isSupabaseConfigured) {
      await updateProjectTaskStatusInDb(taskId, !currentDone);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    const title = newTaskTitle.trim();
    const assignee = newTaskAssignee.trim() || currentUser.fullName;
    setNewTaskTitle("");
    setNewTaskAssignee("");
    setShowTaskForm(false);

    if (isSupabaseConfigured) {
      const res = await createProjectTaskInDb({
        projectId: selectedProjectId,
        title,
        done: false,
        assigneeName: assignee,
      });
      if (res.success && res.data) {
        setProjectTasks((prev) => {
          if (prev.some((t) => t.id === res.data!.id)) return prev;
          return [...prev, res.data!];
        });
      }
    } else {
      setProjectTasks((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}`,
          projectId: selectedProjectId,
          title,
          done: false,
          assigneeName: assignee,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  // Incoming requests: sent TO current user
  const incomingRequests = requests.filter((r) => r.receiverId === currentUser.id);

  // Outgoing requests: sent BY current user
  const outgoingRequests = requests.filter((r) => r.senderId === currentUser.id);

  const applyStatusFilter = (list: CollaborationRequest[]) => {
    if (filterStatus === "all") return list;
    return list.filter((r) => r.status === filterStatus);
  };

  const displayedRequests =
    activeTab === "incoming"
      ? applyStatusFilter(incomingRequests)
      : applyStatusFilter(outgoingRequests);

  const pendingIncomingCount = incomingRequests.filter((r) => r.status === "pending").length;

  const getStatusColor = (status: string) => {
    if (status === "accepted") return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
    if (status === "declined") return "text-rose-300 bg-rose-500/10 border-rose-500/30";
    if (status === "cancelled") return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    return "text-amber-300 bg-amber-500/10 border-amber-500/30";
  };

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-navy-900/80 p-6 backdrop-blur-xl shadow-2xl">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Collaboration Hub
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage skill swap invites, project applications, and team workspaces.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "incoming"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Inbox
            {pendingIncomingCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold leading-none">
                {pendingIncomingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "outgoing"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sent ({outgoingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "workspace"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Team Room
          </button>
        </div>
      </div>

      {/* Requests Tabs (Inbox / Outgoing) */}
      {(activeTab === "incoming" || activeTab === "outgoing") && (
        <div className="pt-6 space-y-4">
          {/* Status filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "pending", "accepted", "declined", "cancelled"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`text-xs px-2.5 py-1 rounded-md border capitalize transition-all ${
                  filterStatus === status
                    ? "bg-navy-800 border-cyan-500/50 text-cyan-300"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {status === "all"
                  ? `All (${activeTab === "incoming" ? incomingRequests.length : outgoingRequests.length})`
                  : status}
              </button>
            ))}
          </div>

          {displayedRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-400">
                {activeTab === "incoming"
                  ? "No incoming requests yet"
                  : "No outgoing requests sent yet"}
              </p>
              <p className="text-xs mt-1">
                {activeTab === "incoming"
                  ? "Request a skill swap from the Discover Teammates tab"
                  : "Browse students and send collaboration proposals"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-800 bg-navy-950/60 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <Image src={req.senderAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={req.senderName} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-slate-700 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{req.senderName}</span>
                        {activeTab === "outgoing" && req.receiverName && (
                          <span className="text-xs text-slate-400">→ {req.receiverName}</span>
                        )}
                        <span className="text-slate-400 text-xs">• {req.senderUniversity}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0">
                          {req.requestType.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.2 rounded-full">
                          {req.synergyScore}% Synergy
                        </span>
                      </div>

                      {req.projectTitle && (
                        <p className="text-xs text-indigo-300 font-medium mt-0.5">
                          Project: {req.projectTitle}
                        </p>
                      )}

                      <p className="text-xs text-slate-300 mt-2 p-2.5 rounded-lg bg-navy-900/80 border border-slate-800 leading-relaxed">
                        &ldquo;{req.pitchMessage}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    {/* Incoming: show accept/decline for pending */}
                    {activeTab === "incoming" && req.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs px-2.5"
                          onClick={() => onDeclineRequest(req.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 text-xs px-3"
                          onClick={() => onAcceptRequest(req.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Accept
                        </Button>
                      </div>
                    ) : activeTab === "outgoing" && req.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${getStatusColor(req.status)}`}
                        >
                          {req.status}
                        </span>
                        {onCancelPendingRequest && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2 border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                            onClick={() => onCancelPendingRequest(req.id)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    ) : req.status === "accepted" ? (
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${getStatusColor(req.status)}`}
                        >
                          {req.status}
                        </span>
                        {onCancelAcceptedCollaboration && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => {
                              if (confirm("Are you sure you want to end and cancel this accepted collaboration?")) {
                                onCancelAcceptedCollaboration(req.id);
                              }
                            }}
                          >
                            End Collab
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${getStatusColor(req.status)}`}
                      >
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Team Workspace */}
      {activeTab === "workspace" && (
        <div className="pt-6 space-y-4">
          {/* Project Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800 bg-navy-950/80">
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Active Project Team Room</span>
                <span className="text-sm font-bold text-white">
                  {selectedProject ? selectedProject.title : "No Project Selected"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Switch Project:</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-8 rounded-lg border border-slate-700 bg-navy-900 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 max-w-xs"
              >
                {projects.map((p) => {
                  const isLead = p.creatorId === currentUser.id;
                  const isAccepted = requests.some(
                    (r) =>
                      r.projectId === p.id &&
                      r.status === "accepted" &&
                      (r.senderId === currentUser.id || r.receiverId === currentUser.id)
                  );
                  const roleTag = isLead ? "(Lead)" : isAccepted ? "(Member)" : "(Not Joined)";
                  return (
                    <option key={p.id} value={p.id}>
                      {p.title} {roleTag}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {!selectedProject && (
            <div className="p-12 text-center rounded-2xl border border-slate-800 bg-navy-950/40 text-slate-400">
              <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
              <h4 className="text-base font-bold text-white mb-1">No Projects Available</h4>
              <p className="text-xs max-w-md mx-auto">
                Create a project in the Explore Projects tab or accept a collaboration invitation to enter a shared Team Room.
              </p>
            </div>
          )}

          {selectedProject && !hasTeamAccess && (
            <div className="p-8 text-center rounded-2xl border border-rose-500/30 bg-rose-950/20 text-rose-300 space-y-2">
              <ShieldAlert className="w-10 h-10 mx-auto text-rose-400" />
              <h4 className="text-base font-bold text-white">Access Restricted</h4>
              <p className="text-xs text-rose-300 max-w-md mx-auto leading-relaxed">
                You must be a project contributor or project lead to access this team room. Send a collaboration proposal or apply for an open role on &ldquo;{selectedProject.title}&rdquo; to join the team.
              </p>
            </div>
          )}

          {selectedProject && hasTeamAccess && (
            <>
              {/* Context status banner */}
              <div className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-navy-950/60 text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    You are in the sprint room for <strong className="text-white">{selectedProject.title}</strong>{" "}
                    as <span className="text-cyan-300 font-semibold">{isCreator ? "Project Lead" : "Team Member"}</span>.
                  </span>
                </div>
                {!isSupabaseConfigured && (
                  <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300 bg-amber-500/10">
                    Preview / Demo Mode
                  </Badge>
                )}
              </div>

              {isLoadingTeamData ? (
                <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  <p className="text-xs">Loading team workspace data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chat Column */}
                  <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-navy-950/70 p-4 flex flex-col h-[480px]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-white text-sm">
                          #team-sprint ({selectedProject.title})
                        </span>
                      </div>
                      <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Persistent Room
                      </span>
                    </div>

                    {/* Message stream */}
                    <div className="flex-1 overflow-y-auto space-y-3 p-2 my-2 scrollbar-thin">
                      {projectMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                          <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-cyan-400" />
                          <p>No messages posted yet in this sprint room.</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">Start the conversation with your team!</p>
                        </div>
                      ) : (
                        projectMessages.map((msg) => {
                          const isSelf = msg.senderId === currentUser.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-start gap-2.5 text-xs ${isSelf ? "flex-row-reverse" : ""}`}
                            >
                              <Image src={msg.senderAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={msg.senderName} width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700" />
                              <div
                                className={`max-w-[80%] rounded-xl p-3 ${
                                  isSelf
                                    ? "bg-cyan-600 text-white rounded-tr-none shadow-md"
                                    : "bg-navy-900 border border-slate-800 text-slate-200 rounded-tl-none"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-bold text-[11px] opacity-90">{msg.senderName}</span>
                                  <span className="text-[10px] opacity-70">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Input box */}
                    <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
                      <Input
                        placeholder="Share an update, design file, or ask your teammates..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        className="shrink-0"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Send
                      </Button>
                    </form>
                  </div>

                  {/* Sprint Checklist Column */}
                  <div className="rounded-2xl border border-slate-800 bg-navy-950/70 p-4 flex flex-col h-[480px]">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        <Kanban className="w-4 h-4 text-indigo-400" /> Sprint Tasks
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2 border-slate-700 hover:border-cyan-500/50"
                        onClick={() => setShowTaskForm((prev) => !prev)}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        {showTaskForm ? "Cancel" : "Add Task"}
                      </Button>
                    </div>

                    {/* Add Task Sub-form */}
                    {showTaskForm && (
                      <form onSubmit={handleCreateTask} className="mb-3 p-3 rounded-xl border border-slate-800 bg-navy-900/90 space-y-2">
                        <Input
                          placeholder="Task description (e.g. Finish API integration)..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="text-xs"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Assignee (e.g. Alex Rivera)..."
                            value={newTaskAssignee}
                            onChange={(e) => setNewTaskAssignee(e.target.value)}
                            className="text-xs flex-1"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="default"
                            className="h-8 text-xs shrink-0"
                            disabled={!newTaskTitle.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-thin">
                      {projectTasks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
                          <CheckSquare className="w-8 h-8 mb-2 opacity-30 text-indigo-400" />
                          <p>No sprint tasks logged yet.</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">Click &ldquo;Add Task&rdquo; to organize your sprint!</p>
                        </div>
                      ) : (
                        projectTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(task.id, task.done)}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-navy-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-xs group"
                          >
                            {task.done ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <span
                                className={`font-medium block leading-snug break-words ${
                                  task.done ? "line-through text-slate-500" : "text-slate-200"
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.assigneeName && (
                                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                                  Assigned: {task.assigneeName}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Progress */}
                    {projectTasks.length > 0 && (
                      <div className="pt-3 border-t border-slate-800 mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Team Readiness</span>
                          <span className="text-cyan-300 font-bold">
                            {Math.round((projectTasks.filter((t) => t.done).length / projectTasks.length) * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-navy-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(
                                (projectTasks.filter((t) => t.done).length / projectTasks.length) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {projectTasks.filter((t) => !t.done).length > 0
                            ? `${projectTasks.filter((t) => !t.done).length} task(s) remaining before release.`
                            : "🚀 All sprint tasks finished — ready to ship!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
