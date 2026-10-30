import React from "react";
import { Sparkles, Heart, Shield, Code, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-navy-950 py-12 text-xs text-slate-400">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">SkillSwap AI</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Find your perfect team. SkillSwap AI connects college students through AI-driven bilateral skill complementarity, work style synchronization, and team gap analysis.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
              <span>Next.js App Router</span>
              <span>&bull;</span>
              <span>TypeScript</span>
              <span>&bull;</span>
              <span>Tailwind CSS</span>
              <span>&bull;</span>
              <span>Supabase RLS</span>
              <span>&bull;</span>
              <span>Framer Motion</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>Teammate Discovery & Synergy Index</li>
              <li>Project Recruitment Showcase</li>
              <li>AI Dream Team Generator Studio</li>
              <li>Bilateral Skill Matrix</li>
              <li>Supabase Row Level Security Architecture</li>
            </ul>
          </div>

          {/* Community & Open Tech */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Built for Student Builders
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Designed to power college hackathon teams, senior capstone projects, and student venture studios.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-navy-900 border border-slate-800 text-[11px] text-slate-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>RLS Verified & Privacy-First</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>&copy; {new Date().getFullYear()} SkillSwap AI. Built with precision for ambitious student innovators.</span>
          <span className="flex items-center gap-1">
            Engineered for high-synergy collaboration <Sparkles className="w-3 h-3 text-cyan-400" />
          </span>
        </div>
      </div>
    </footer>
  );
}
