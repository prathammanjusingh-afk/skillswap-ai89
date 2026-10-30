"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface CollabHubProps {
  requests: CollaborationRequest[];
  currentUser: StudentProfile;
  projects: Project[];
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
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
}: CollabHubProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "workspace">("requests");
  const [filterType, setFilterType] = useState<"all" | "pending" | "accepted">("all");

  // Mock Workspace state
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design System Tokens & Dark Palette", done: true, assignee: "Alex Rivera" },
    { id: 2, title: "SwapEngine Compatibility Algorithm", done: true, assignee: "Priya Sharma" },
    { id: 3, title: "Supabase Schema & RLS Security Policies", done: true, assignee: "Alex Rivera" },
    { id: 4, title: "Hackathon Pitch Slide Deck & Demo Video", done: false, assignee: "Team" },
  ]);

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
      senderName: "Alex Rivera",
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

    setChatMessages([...chatMessages, msg]);
    setNewMessage("");
  };

  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const filteredRequests = requests.filter((r) => {
    if (filterType === "all") return true;
    return r.status === filterType;
  });

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-navy-900/80 p-6 backdrop-blur-xl shadow-2xl">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Collaboration Hub & Active Workspace
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Manage incoming skill swap invites and collaborate in real-time with accepted project teammates.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-navy-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "requests"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Proposals & Invites ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "workspace"
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Live Team Room (3)
          </button>
        </div>
      </div>

      {/* Tab 1: Requests & Proposals */}
      {activeTab === "requests" && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`text-xs px-2.5 py-1 rounded-md border ${
                  filterType === "all"
                    ? "bg-navy-800 border-cyan-500/50 text-cyan-300"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setFilterType("pending")}
                className={`text-xs px-2.5 py-1 rounded-md border ${
                  filterType === "pending"
                    ? "bg-navy-800 border-cyan-500/50 text-cyan-300"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterType("accepted")}
                className={`text-xs px-2.5 py-1 rounded-md border ${
                  filterType === "accepted"
                    ? "bg-navy-800 border-cyan-500/50 text-cyan-300"
                    : "border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Accepted
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-800 bg-navy-950/60 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={req.senderAvatar}
                    alt={req.senderName}
                    className="w-11 h-11 rounded-full object-cover border border-slate-700 mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {req.senderName}
                      </span>
                      <span className="text-slate-400 text-xs">
                        &bull; {req.senderUniversity}
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] uppercase font-bold py-0"
                      >
                        {req.requestType.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.2 rounded-full">
                        {req.synergyScore}% Synergy
                      </span>
                    </div>

                    {req.projectTitle && (
                      <p className="text-xs text-indigo-300 font-medium mt-0.5">
                        Regarding Project: {req.projectTitle}
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

                  {req.status === "pending" ? (
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
                        Accept & Form Team
                      </Button>
                    </div>
                  ) : (
                    <Badge
                      variant={req.status === "accepted" ? "success" : "rose"}
                      className="capitalize text-xs font-semibold"
                    >
                      {req.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Live Team Workspace */}
      {activeTab === "workspace" && (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Column */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-navy-950/70 p-4 flex flex-col h-[480px]">
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
            <div className="flex-1 overflow-y-auto space-y-3 p-2 my-2">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 text-xs ${
                    msg.isSelf ? "flex-row-reverse" : ""
                  }`}
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
                      <span className="font-bold text-[11px] opacity-90">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input box */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
              <Input
                placeholder="Share a milestone or ask teammates a question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="default" size="sm" className="shrink-0">
                <Send className="w-3.5 h-3.5 mr-1" /> Send
              </Button>
            </form>
          </div>

          {/* Sprint Checklist Column */}
          <div className="rounded-2xl border border-slate-800 bg-navy-950/70 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-indigo-400" /> Sprint Milestones
                </span>
                <span className="text-xs text-cyan-300 font-semibold">
                  {tasks.filter((t) => t.done).length}/{tasks.length} Completed
                </span>
              </div>

              <div className="space-y-2.5">
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
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-bold block mb-1">
                🚀 Hackathon Readiness: 75%
              </span>
              Complete remaining pitch and edge deployment tasks to finalize submission.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
