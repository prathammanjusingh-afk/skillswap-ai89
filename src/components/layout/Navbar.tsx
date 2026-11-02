"use client";

import React, { useState, useEffect, useRef } from "react";
import { StudentProfile, NotificationItem } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { AvatarImage } from "@/components/ui/avatar-image";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Users,
  Rocket,
  MessageSquare,
  Sliders,
  ChevronDown,
  Database,
  Menu,
  X,
  LayoutGrid,
  Calendar,
  ShieldAlert,
  LogIn,
  LogOut,
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: StudentProfile;
  availablePersonas: StudentProfile[];
  onSwitchPersona: (persona: StudentProfile) => void;
  pendingRequestsCount: number;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (notificationId: string) => void;
  onMarkAllNotificationsRead: () => void;
  unreadMessageCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  availablePersonas,
  onSwitchPersona,
  pendingRequestsCount,
  isAuthenticated,
  onOpenAuth,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  unreadMessageCount,
}: NavbarProps) {
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close persona dropdown on outside click
  useEffect(() => {
    if (!isPersonaOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isPersonaOpen]);

  const isAdmin = currentUser.role === "admin";

  const navItems = [
    { id: "home", label: "Home", icon: Sparkles },
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "students", label: "Find Skills", icon: Users },
    { id: "projects", label: "Projects", icon: Rocket },
    { id: "ai-studio", label: "AI Match", icon: Sparkles, badge: "AI" },
    {
      id: "collab",
      label: "Swap Requests",
      icon: MessageSquare,
      count: pendingRequestsCount,
    },
    { id: "sessions", label: "Sessions", icon: Calendar },
    {
      id: "messages",
      label: "Messages",
      icon: MessageSquare,
      count: unreadMessageCount,
    },
    { id: "profile", label: "Profile", icon: Sliders },
    ...(isAdmin
      ? [{ id: "admin", label: "Admin", icon: ShieldAlert, badge: "MOD" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  SkillSwap
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 text-navy-950 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-1 hidden sm:block">
                Find your perfect team.
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                    isActive
                      ? "text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-navy-900/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : ""}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-gradient-to-r from-cyan-400 to-indigo-400 text-navy-950 font-bold px-1 py-0.5 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === "number" && item.count > 0 && (
                    <span className="text-[9px] bg-cyan-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse leading-none">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Notifications, Auth, Persona Switcher & Database Pill */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={onMarkNotificationRead}
            onMarkAllAsRead={onMarkAllNotificationsRead}
            onNavigateTab={setActiveTab}
          />

          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              title="Log out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-navy-900/60 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Supabase status indicator */}
          <div
            title={
              isSupabaseConfigured
                ? "Connected to live Supabase PostgreSQL & Auth"
                : "Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
            }
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium bg-navy-900 border border-slate-800 text-slate-300"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span>{isSupabaseConfigured ? "Supabase Live" : "Not Connected"}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSupabaseConfigured ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
          </div>

          {/* Active Persona Dropdown */}
          <div className="relative" ref={personaRef}>
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              <AvatarImage
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                size={28}
                className="border border-cyan-400/50"
              />
              <div className="hidden sm:block text-left">
                <span className="font-bold text-white block text-[11px] leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  {currentUser.university.split(" ")[0]}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Active Account / Persona Menu */}
            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-navy-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                {isAuthenticated ? (
                  <div className="p-3 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <AvatarImage
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        size={36}
                        className="border border-cyan-400/40"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white block text-xs truncate">
                          {currentUser.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {currentUser.university}
                        </span>
                        {currentUser.email && (
                          <span className="text-[10px] text-cyan-300/80 block truncate">
                            {currentUser.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Profile Privacy:</span>
                      <Badge
                        variant={currentUser.isPublic ? "success" : "outline"}
                        className="text-[10px] py-0"
                      >
                        {currentUser.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Database Role:</span>
                      <Badge
                        variant={currentUser.role === "admin" ? "indigo" : "outline"}
                        className="text-[10px] uppercase font-bold py-0"
                      >
                        {currentUser.role || "student"}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-xs h-8"
                        onClick={() => {
                          setActiveTab("profile");
                          setIsPersonaOpen(false);
                        }}
                      >
                        <Sliders className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        My Profile &amp; Privacy
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full text-xs h-8"
                        onClick={() => {
                          onLogout();
                          setIsPersonaOpen(false);
                        }}
                      >
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Guest / Demo Session
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Sign in with Supabase or preview bilateral matching from test student profiles:
                      </p>
                    </div>

                    <div className="space-y-1 mb-2">
                      {availablePersonas.map((persona) => {
                        const isSelected = persona.id === currentUser.id;
                        return (
                          <button
                            key={persona.id}
                            onClick={() => {
                              onSwitchPersona(persona);
                              setIsPersonaOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all text-xs ${
                              isSelected
                                ? "bg-cyan-500/15 border border-cyan-500/30 text-white"
                                : "hover:bg-navy-800/80 text-slate-300"
                            }`}
                          >
                            <AvatarImage
                              src={persona.avatarUrl}
                              alt={persona.fullName}
                              size={30}
                              className="border border-slate-700"
                            />
                            <div className="flex-1 truncate">
                              <span className="font-bold text-white block text-xs truncate">
                                {persona.fullName}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {persona.skillsOffered[0]?.name} &bull; {persona.university}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      size="sm"
                      variant="glow"
                      className="w-full text-xs h-8"
                      onClick={() => {
                        onOpenAuth();
                        setIsPersonaOpen(false);
                      }}
                    >
                      <LogIn className="w-3.5 h-3.5 mr-1.5" />
                      Sign In with Real Account
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-navy-950 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white hover:bg-navy-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === "number" && item.count > 0 && (
                  <span className="bg-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
