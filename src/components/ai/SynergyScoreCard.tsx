"use client";

import React, { useState } from "react";
import { SynergyBreakdown } from "@/types";
import { getSynergyColor } from "@/lib/utils";
import { Sparkles, ChevronDown, ChevronUp, Zap, Clock, Compass, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SynergyScoreCardProps {
  synergy: SynergyBreakdown;
  compact?: boolean;
}

export function SynergyScoreCard({ synergy, compact = false }: SynergyScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = getSynergyColor(synergy.overallScore);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${color.bg} ${color.text} ${color.border} ${color.glow} transition-all`}
      >
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>{synergy.overallScore}% AI Match</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${color.bg} ${color.border} ${color.glow}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-navy-950/80 border border-slate-700/60 shadow-inner">
            <span className={`text-xl font-bold tracking-tight ${color.text}`}>
              {synergy.overallScore}%
            </span>
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping opacity-75"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className={`w-4 h-4 ${color.text}`} />
              <h4 className="text-sm font-bold text-white tracking-wide">
                {synergy.synergyLevel} Match
              </h4>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              AI-calculated complementarity index
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-navy-800 transition-colors"
        >
          <span>{isExpanded ? "Hide Details" : "View Breakdown"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Progress Bars Overview */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/40 text-xs">
        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Skill Synergy
            </span>
            <span className="font-semibold text-cyan-400">
              {synergy.skillComplementScore}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${synergy.skillComplementScore}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" /> Availability Fit
            </span>
            <span className="font-semibold text-indigo-400">
              {synergy.timeCommitmentScore}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${synergy.timeCommitmentScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expandable AI Insights */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 pt-3 border-t border-slate-700/40"
          >
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="p-2 rounded-lg bg-navy-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-emerald-400" /> Work Rhythm
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {synergy.workStyleScore}% Match
                </span>
              </div>
              <div className="p-2 rounded-lg bg-navy-950/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1">
                  <Target className="w-3 h-3 text-amber-400" /> Academic & Goals
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {synergy.goalAlignmentScore}% Match
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-semibold text-slate-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> AI Compatibility
                Analysis:
              </p>
              {synergy.complementaryHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-navy-950/40 p-2 rounded-md border border-slate-800/60"
                >
                  <span className="text-cyan-400 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{highlight}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
