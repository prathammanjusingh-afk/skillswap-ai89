"use client";

import React, { useState } from "react";
import { StudentProfile } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
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
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: StudentProfile;
  availablePersonas: StudentProfile[];
  onSwitchPersona: (persona: StudentProfile) => void;
  pendingRequestsCount: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  availablePersonas,
  onSwitchPersona,
  pendingRequestsCount,
}: NavbarProps) {
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "students", label: "Discover Teammates", icon: Users },
    { id: "projects", label: "Explore Projects", icon: Rocket },
    { id: "ai-studio", label: "AI Dream Team Studio", icon: Sparkles, badge: "AI" },
    {
      id: "collab",
      label: "Collaboration Hub",
      icon: MessageSquare,
      count: pendingRequestsCount,
    },
    { id: "profile", label: "My Skill Matrix", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveTab("students")}
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
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-navy-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : ""}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-gradient-to-r from-cyan-400 to-indigo-400 text-navy-950 font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === "number" && item.count > 0 && (
                    <span className="text-[10px] bg-cyan-500 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Persona Switcher & Database Pill */}
        <div className="flex items-center gap-3">
          {/* Supabase status indicator */}
          <div
            title={
              isSupabaseConfigured
                ? "Connected to live Supabase PostgreSQL & RLS"
                : "Running in Interactive Demo Mode with preloaded student network"
            }
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-navy-900 border border-slate-800 text-slate-300"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isSupabaseConfigured ? "Supabase Live" : "Demo Store"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? "bg-emerald-400 animate-ping" : "bg-cyan-400"
              }`}
            />
          </div>

          {/* Active Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 transition-all text-xs"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-7 h-7 rounded-full object-cover border border-cyan-400/50"
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

            {/* Persona Switch Menu */}
            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-navy-900 border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Switch Test Persona
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Experience dynamic bilateral matching from different student perspectives:
                  </p>
                </div>

                <div className="space-y-1">
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
                        <img
                          src={persona.avatarUrl}
                          alt={persona.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
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
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
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
        <div className="lg:hidden border-t border-slate-800 bg-navy-950 p-4 space-y-1">
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
