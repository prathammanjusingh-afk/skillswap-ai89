"use client";
import Image from "next/image";

import React, { useState } from "react";
import { ChatMessage, StudentProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Send,
  Calendar,
  Users,
  Search,
  Check,
  CheckCheck,
} from "lucide-react";

interface DirectMessagingHubProps {
  currentUser: StudentProfile;
  students: StudentProfile[];
  messages: ChatMessage[];
  onSendMessage: (receiverId: string, content: string) => void;
  onOpenScheduleModal: (partner: StudentProfile) => void;
  onNavigate: (tab: string) => void;
  onMarkMessagesAsRead?: (partnerId: string) => void;
}

export function DirectMessagingHub({
  currentUser,
  students,
  messages,
  onSendMessage,
  onOpenScheduleModal,
  onNavigate,
  onMarkMessagesAsRead,
}: DirectMessagingHubProps) {
  // Available partners from the student roster (excluding self)
  const peerPartners = students.filter((s) => s.id !== currentUser.id);

  const [activePartnerId, setActivePartnerId] = useState<string>(
    peerPartners[0]?.id || ""
  );
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  const activePartner = peerPartners.find((p) => p.id === activePartnerId) || peerPartners[0];

  // Auto mark incoming messages as read when viewing conversation
  React.useEffect(() => {
    if (activePartnerId && onMarkMessagesAsRead) {
      const hasUnread = messages.some(
        (m) => m.senderId === activePartnerId && m.receiverId === currentUser.id && !m.read
      );
      if (hasUnread) {
        onMarkMessagesAsRead(activePartnerId);
      }
    }
  }, [activePartnerId, messages, currentUser.id, onMarkMessagesAsRead]);

  // Filter messages between current user and active partner
  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.receiverId === activePartnerId) ||
      (m.senderId === activePartnerId && m.receiverId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId) return;
    onSendMessage(activePartnerId, inputText.trim());
    setInputText("");
  };

  const filteredPartners = peerPartners.filter((p) =>
    p.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.university.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-navy-900/80 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[620px]">
      {/* Left Sidebar: Conversations / Peers */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-navy-950/60 shrink-0">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              Direct Messages
            </h3>
            <span className="text-[10px] text-slate-400 bg-navy-900 px-2 py-0.5 rounded-full border border-slate-800">
              {peerPartners.length} Peers
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <Input
              placeholder="Filter conversations..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 h-8 text-xs bg-navy-950"
            />
          </div>
        </div>

        {/* Partners List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
          {filteredPartners.map((partner) => {
            const isSelected = partner.id === activePartnerId;
            // Find last message
            const lastMsg = [...messages]
              .reverse()
              .find(
                (m) =>
                  (m.senderId === currentUser.id && m.receiverId === partner.id) ||
                  (m.senderId === partner.id && m.receiverId === currentUser.id)
              );

            const unreadCount = messages.filter(
              (m) => m.senderId === partner.id && m.receiverId === currentUser.id && !m.read
            ).length;

            return (
              <button
                key={partner.id}
                onClick={() => setActivePartnerId(partner.id)}
                className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                  isSelected
                    ? "bg-navy-850 border-l-2 border-cyan-400"
                    : "hover:bg-navy-900/50"
                }`}
              >
                <div className="relative shrink-0">
                  <Image src={partner.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={partner.fullName} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-navy-950" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-white text-xs truncate">
                      {partner.fullName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {lastMsg && (
                        <span className="text-[10px] text-slate-500">
                          {lastMsg.timestamp}
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500 text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {lastMsg ? lastMsg.content : `${partner.university} · ${partner.skillsOffered[0]?.name}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Pane */}
      <div className="flex-1 flex flex-col bg-navy-900/40">
        {activePartner ? (
          <>
            {/* Header */}
            <div className="p-3.5 sm:px-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-navy-950/40">
              <div className="flex items-center gap-3">
                <Image src={activePartner.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={activePartner.fullName} width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-cyan-500/50" />
                <div>
                  <h4 className="font-bold text-white text-sm leading-tight">
                    {activePartner.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {activePartner.university} · Can teach: {activePartner.skillsOffered.slice(0, 2).map((s) => s.name).join(", ")}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onOpenScheduleModal(activePartner)}
              >
                <Calendar className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                Schedule Session
              </Button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mb-1" />
                  <p className="font-semibold text-white text-xs">
                    Start a conversation with {activePartner.fullName}
                  </p>
                  <p className="text-[11px] max-w-sm">
                    Introduce yourself, propose a topic you want to learn, or offer help on their project.
                  </p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isSelf = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 text-xs ${
                        isSelf ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isSelf && (
                        <Image src={activePartner.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"} alt={activePartner.fullName} width={36} height={36} className="w-6 h-6 rounded-full object-cover border border-slate-700 shrink-0 mb-1" />
                      )}
                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed ${
                          isSelf
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none"
                            : "bg-navy-950 border border-slate-800 text-slate-200 rounded-bl-none"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isSelf ? "text-cyan-200" : "text-slate-500"
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isSelf && (
                            msg.read ? (
                              <span title="Read" className="flex items-center text-cyan-200">
                                <CheckCheck className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span title="Sent" className="flex items-center text-cyan-300/70">
                                <Check className="w-3 h-3" />
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2 bg-navy-950/60">
              <Input
                placeholder={`Message ${activePartner.fullName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-xs h-9"
              />
              <Button type="submit" variant="glow" size="sm" className="h-9 px-4 shrink-0">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs">
            Select a conversation to begin messaging
          </div>
        )}
      </div>
    </div>
  );
}
