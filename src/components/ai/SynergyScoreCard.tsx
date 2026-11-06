"use client";

import React, { useState } from "react";
import { SynergyBreakdown } from "@/types";
import { getSynergyColor } from "@/lib/utils";
import { Sparkles, ChevronDown, ChevronUp, Zap, Clock, Target, Award, Heart } from "lucide-react";
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-purple-500/30 bg-purple-600/15 text-purple-300 shadow-sm transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span>{synergy.overallScore}% AI Match</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4 transition-all shadow-lg"
      style={{
        background:
          "radial-gradient(130.39% 130.39% at 51.31% -0.71%, rgba(31, 41, 55, 0.4) 0%, rgba(17, 24, 39, 0.6) 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gray-950 border border-gray-800 shadow-inner">
            <span className="text-xl font-bold tracking-tight text-purple-300">
              {synergy.overallScore}%
            </span>
            <div
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping opacity-75"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white tracking-wide">
                {synergy.synergyLevel} Match
              </h4>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Transparent 5-factor compatibility index
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <span>{isExpanded ? "Hide Details" : "View Breakdown"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Progress Bars Overview (Top 2 Primary Drivers) */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-800 text-xs">
        <div>
          <div className="flex justify-between text-gray-300 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" /> Skill Fit (35%)
            </span>
            <span className="font-semibold text-purple-400">
              {synergy.skillComplementScore}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${synergy.skillComplementScore}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-gray-300 mb-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-400" /> Interests (25%)
            </span>
            <span className="font-semibold text-pink-400">
              {synergy.interestsScore}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${synergy.interestsScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expandable Transparent Breakdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 pt-3 border-t border-gray-800"
          >
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-violet-400" /> Hours (15%)
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {synergy.timeCommitmentScore}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Target className="w-3 h-3 text-amber-400" /> Goals (15%)
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {synergy.goalAlignmentScore}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-gray-950/80 border border-gray-800">
                <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                  <Award className="w-3 h-3 text-emerald-400" /> Exp. (10%)
                </span>
                <span className="font-semibold text-white mt-0.5 block">
                  {synergy.experienceScore}%
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-gray-300">
              <p className="font-semibold text-gray-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> Algorithm Match
                Factors:
              </p>
              {synergy.complementaryHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 bg-gray-950/60 p-2 rounded-lg border border-gray-800"
                >
                  <span className="text-purple-400 font-bold mt-0.5">•</span>
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

export default SynergyScoreCard;
