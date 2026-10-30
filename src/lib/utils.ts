import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAvailability(hours: number): string {
  if (hours <= 10) return `${hours} hrs/wk (Part-time)`;
  if (hours <= 20) return `${hours} hrs/wk (Standard)`;
  return `${hours} hrs/wk (High focus)`;
}

export function getSynergyColor(score: number): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  if (score >= 90) {
    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    };
  }
  if (score >= 80) {
    return {
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      glow: "shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    };
  }
  if (score >= 70) {
    return {
      text: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      glow: "shadow-[0_0_15px_rgba(99,102,241,0.25)]",
    };
  }
  return {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
  };
}

export function getCategoryBadgeColor(category: string): string {
  switch (category) {
    case "frontend":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    case "backend":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "ai_ml":
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "design":
      return "bg-pink-500/15 text-pink-300 border-pink-500/30";
    case "cloud_devops":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "mobile":
      return "bg-teal-500/15 text-teal-300 border-teal-500/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}
