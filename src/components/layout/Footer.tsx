import React from "react";
import { Sparkles, Shield, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-gray-800 bg-[#0B0F19]/80 py-12 text-xs text-gray-400">
      <div className="custom-screen">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-500 text-white shadow-md shadow-purple-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">SkillSwap AI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                Marketplace
              </span>
            </div>
            <p className="text-gray-400 text-xs max-w-md leading-relaxed">
              The premier AI-driven skill exchange and collaborative team-building marketplace for ambitious students and creators. Exchange knowledge, find hackathon teammates, and build real-world projects.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 pt-1">
              <span>Next.js 14</span>
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
            <h4 className="font-semibold text-gray-100 uppercase tracking-wider text-[11px] mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-gray-400 text-xs">
              <li className="hover:text-purple-300 transition-colors cursor-pointer">AI Bilateral Skill Matrix</li>
              <li className="hover:text-purple-300 transition-colors cursor-pointer">Project Recruitment Showcase</li>
              <li className="hover:text-purple-300 transition-colors cursor-pointer">Dream Team Generator Studio</li>
              <li className="hover:text-purple-300 transition-colors cursor-pointer">1-on-1 Mentorship Sessions</li>
              <li className="hover:text-purple-300 transition-colors cursor-pointer">Supabase Row-Level Security</li>
            </ul>
          </div>

          {/* Built for Student Builders */}
          <div>
            <h4 className="font-semibold text-gray-100 uppercase tracking-wider text-[11px] mb-3">
              Built for Innovators
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              Designed to power college hackathon teams, senior capstone projects, and student venture studios worldwide.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-[11px] text-gray-300">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>RLS Verified &amp; Privacy-First</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <span>&copy; {new Date().getFullYear()} SkillSwap AI. All rights reserved.</span>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-red-500 inline fill-red-500" /> for student builders
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
