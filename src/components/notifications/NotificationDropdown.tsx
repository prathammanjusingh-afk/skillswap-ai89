"use client";

import React, { useState, useRef, useEffect } from "react";
import { NotificationItem } from "@/types";
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  Calendar,
  Sparkles,
  Users,
  X,
} from "lucide-react";

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigateTab,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "request_received":
      case "request_accepted":
      case "request_declined":
        return <Users className="w-3.5 h-3.5 text-cyan-400" />;
      case "session_scheduled":
      case "session_reminder":
        return <Calendar className="w-3.5 h-3.5 text-indigo-400" />;
      case "new_message":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case "review_received":
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-navy-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-navy-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-navy-950/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded-full font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No notifications right now
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onMarkAsRead(item.id);
                    if (item.linkTab) {
                      onNavigateTab(item.linkTab);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 transition-colors cursor-pointer text-left flex items-start gap-3 ${
                    item.read
                      ? "hover:bg-navy-850/50 opacity-70"
                      : "bg-navy-950/40 hover:bg-navy-850"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-800 mt-0.5 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-white text-xs truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {item.createdAt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {item.message}
                    </p>
                  </div>
                  {!item.read && (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
