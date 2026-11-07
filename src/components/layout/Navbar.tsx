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
  ArrowRight,
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

  const handleScrollTo = (id: string) => {
    if (activeTab !== "home") {
      setActiveTab("home");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-[#0B0F19]/90 backdrop-blur-xl">
      <div className="custom-screen flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-pink-500 shadow-md shadow-purple-600/30 group-hover:shadow-purple-600/50 transition-all duration-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-lg tracking-tight">
                SkillSwap
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                AI
              </span>
            </div>
          </div>

          {/* Desktop Mailgo Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm text-gray-300 font-medium">
            <button
              onClick={() => setActiveTab("home")}
              className={`hover:text-white transition-colors ${
                activeTab === "home" ? "text-purple-400 font-semibold" : ""
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`hover:text-white transition-colors ${
                activeTab === "students" ? "text-purple-400 font-semibold" : ""
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`hover:text-white transition-colors ${
                activeTab === "projects" ? "text-purple-400 font-semibold" : ""
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("ai-studio")}
              className={`flex items-center gap-1 hover:text-white transition-colors ${
                activeTab === "ai-studio" ? "text-purple-400 font-semibold" : ""
              }`}
            >
              <span>AI Match</span>
              <span className="text-[9px] font-bold bg-purple-600/80 text-white px-1.5 py-0.2 rounded-full">
                AI
              </span>
            </button>
            <button
              onClick={() => handleScrollTo("features")}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo("testimonials")}
              className="hover:text-white transition-colors"
            >
              Testimonials
            </button>
            <button
              onClick={() => handleScrollTo("pricing")}
              className="hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => handleScrollTo("faqs")}
              className="hover:text-white transition-colors"
            >
              FAQs
            </button>
          </nav>
        </div>

        {/* Right Side: Actions / Auth / Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown (when logged in or browsing) */}
          <NotificationDropdown
            notifications={notifications}
            onMarkAsRead={onMarkNotificationRead}
            onMarkAllAsRead={onMarkAllNotificationsRead}
            onNavigateTab={setActiveTab}
          />

          {/* Messages shortcut with unread badge */}
          <button
            onClick={() => setActiveTab("messages")}
            title="Peer Messages"
            className={`relative p-2 rounded-full border transition-all ${
              activeTab === "messages"
                ? "border-purple-500/50 bg-purple-600/20 text-white"
                : "border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadMessageCount}
              </span>
            )}
          </button>

          {/* If Authenticated: Dashboard pill & Persona Menu */}
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeTab === "dashboard"
                    ? "border-purple-500 bg-purple-600 text-white"
                    : "border-gray-700 bg-gray-900/80 text-gray-200 hover:border-gray-500 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* Persona Profile Menu */}
              <div className="relative" ref={personaRef}>
                <button
                  onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-gray-900/90 border border-gray-800 hover:border-gray-700 hover:bg-gray-800/80 transition-all text-xs"
                >
                  <AvatarImage
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    size={26}
                    className="border border-purple-500/50"
                  />
                  <span className="hidden sm:inline font-semibold text-white text-xs max-w-[90px] truncate">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isPersonaOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-gray-900 border border-gray-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="p-2 border-b border-gray-800">
                      <p className="font-semibold text-white text-xs truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {currentUser.headline}
                      </p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setActiveTab("dashboard");
                          setIsPersonaOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-purple-400" />
                        <span>Mission Control Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("profile");
                          setIsPersonaOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <Sliders className="w-3.5 h-3.5 text-purple-400" />
                        <span>Edit Skill Profile & Radar</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("collab");
                          setIsPersonaOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                          <span>Swap Requests & Team Room</span>
                        </div>
                        {pendingRequestsCount > 0 && (
                          <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                            {pendingRequestsCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("sessions");
                          setIsPersonaOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-gray-800"
                      >
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>1-on-1 Sessions Manager</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setActiveTab("admin");
                            setIsPersonaOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                          <span>Admin Security & Audits</span>
                        </button>
                      )}
                    </div>

                    {/* Persona Switcher Section */}
                    <div className="border-t border-gray-800 pt-1 mt-1">
                      <p className="px-2.5 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Quick Demo Personas
                      </p>
                      <div className="space-y-0.5">
                        {availablePersonas.map((persona) => {
                          const isCurrent = persona.id === currentUser.id;
                          return (
                            <button
                              key={persona.id}
                              onClick={() => {
                                onSwitchPersona(persona);
                                setIsPersonaOpen(false);
                              }}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                isCurrent
                                  ? "bg-purple-600/20 text-purple-300 font-semibold"
                                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
                              }`}
                            >
                              <AvatarImage
                                src={persona.avatarUrl}
                                alt={persona.fullName}
                                size={18}
                              />
                              <span className="truncate">{persona.fullName}</span>
                              <span className="text-[10px] text-gray-500 ml-auto">
                                {persona.university.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-gray-800 pt-1 mt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsPersonaOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Unauthenticated: Mailgo Exact Sign In + Start Now Buttons */
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAuth}
                className="text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-white font-medium custom-btn-bg border border-gray-600 hover:border-gray-400 px-3.5 py-1.5 rounded-full transition-all duration-150"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-[#0B0F19] p-4 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-800">
            <button
              onClick={() => {
                setActiveTab("home");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left ${
                activeTab === "home"
                  ? "bg-purple-600/20 text-white border border-purple-500/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab("students");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left ${
                activeTab === "students"
                  ? "bg-purple-600/20 text-white border border-purple-500/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => {
                setActiveTab("projects");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left ${
                activeTab === "projects"
                  ? "bg-purple-600/20 text-white border border-purple-500/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => {
                setActiveTab("ai-studio");
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left ${
                activeTab === "ai-studio"
                  ? "bg-purple-600/20 text-white border border-purple-500/40"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              AI Studio
            </button>
          </div>

          <div className="pt-1 space-y-1">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-gray-300 hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-purple-400" />
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("collab");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-gray-300 hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Swap Requests</span>
              </div>
              {pendingRequestsCount > 0 && (
                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("sessions");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-gray-300 hover:bg-gray-800"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>1-on-1 Sessions</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("profile");
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-gray-300 hover:bg-gray-800"
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Skill Profile</span>
            </button>
          </div>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-gray-800">
              <Button
                variant="purple"
                className="w-full"
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In / Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
