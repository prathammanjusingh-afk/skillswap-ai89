"use client";

import React, { useState, useRef, useEffect } from "react";
import { CollaborationRequest, StudentProfile, Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ArrowRight,
  Inbox,
  ArrowUpRight,
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

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
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

  // Demo workspace chat (local-only, not persisted — labelled clearly)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      senderName: "Priya Sharma",
      senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      content: "Hey team! I deployed the PyTorch embedding pipeline on Modal. The cosine similarity response time is down to 42ms!",
      timestamp: "10:14 AM",
      isSelf: false,
    },
    {
      id: "2",
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      content: "Nice work Priya! I just finished the Next.js 14 App Router integration and hooked up the interactive radar charts.",
      timestamp: "10:18 AM",
      isSelf: true,
    },
    {
      id: "3",
      senderName: "Marcus Chen",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      content: "PostgreSQL schemas and RLS policies are verified. We are ready to ship to Vercel for the hackathon demo!",
      timestamp: "10:22 AM",
      isSelf: false,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Design System Tokens & Dark Palette", done: true, assignee: "Alex Rivera" },
    { id: 2, title: "SwapEngine Compatibility Algorithm", done: true, assignee: "Priya Sharma" },
    { id: 3, title: "Supabase Schema & RLS Security Policies", done: true, assignee: "Alex Rivera" },
    { id: 4, title: "Hackathon Pitch Slide Deck & Demo Video", done: false, assignee: "Team" },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSelf: true,
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  };

  // Incoming requests: sent TO current user
  const incomingRequests = requests.filter((r) => r.receiverId === currentUser.id);

  // Outgoing requests: sent BY current user
  const outgoingRequests = requests.filter((r) => r.senderId === currentUser.id);

  const applyStatusFilter = (list: CollaborationRequest[]) => {
    if (filterStatus === "all") return list;
    return list.filter((r) => r.status === filterStatus);
  };

  const displayedRequests = activeTab === "incoming"
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
            Manage skill swap invites, project applications, and team invitations.
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
                    <img
                      src={req.senderAvatar}
                      alt={req.senderName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 mt-0.5 shrink-0"
                    />
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
          {/* Demo label */}
          <div className="px-3 py-2 rounded-xl border border-slate-800 bg-navy-950/60 text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-slate-300">Team Room — Demo Mode.</strong>{" "}
              This is a shared workspace preview. Accept an invitation to start real-time collaboration with teammates.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Column */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-navy-950/70 p-4 flex flex-col h-[460px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">
                    #general-sprint-room (NeuroScribe AI Team)
                  </span>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  3 members active
                </span>
              </div>

              {/* Message stream */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 my-2 scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 text-xs ${msg.isSelf ? "flex-row-reverse" : ""}`}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                    />
                    <div
                      className={`max-w-[80%] rounded-xl p-3 ${
                        msg.isSelf
                          ? "bg-cyan-600 text-white rounded-tr-none shadow-md"
                          : "bg-navy-900 border border-slate-800 text-slate-200 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[11px] opacity-90">{msg.senderName}</span>
                        <span className="text-[10px] opacity-70">{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input box */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
                <Input
                  placeholder="Share an update or ask your teammates..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-xs"
                />
                <Button type="submit" variant="default" size="sm" className="shrink-0" disabled={!newMessage.trim()}>
                  <Send className="w-3.5 h-3.5 mr-1" /> Send
                </Button>
              </form>
            </div>

            {/* Sprint Checklist Column */}
            <div className="rounded-2xl border border-slate-800 bg-navy-950/70 p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-indigo-400" /> Sprint Milestones
                </span>
                <span className="text-xs text-cyan-300 font-semibold">
                  {tasks.filter((t) => t.done).length}/{tasks.length} Done
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-navy-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-xs"
                  >
                    {task.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span
                        className={`font-medium block leading-snug ${
                          task.done ? "line-through text-slate-500" : "text-slate-200"
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Assigned: {task.assignee}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="pt-4 border-t border-slate-800 mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Team Readiness</span>
                  <span className="text-cyan-300 font-bold">
                    {Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-navy-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {tasks.filter((t) => !t.done).length > 0
                    ? `${tasks.filter((t) => !t.done).length} task(s) remaining before submission.`
                    : "🚀 All tasks complete — ready to ship!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
