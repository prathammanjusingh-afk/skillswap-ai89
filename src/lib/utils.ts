export { cn } from "cn";

/**
 * Return Tailwind color classes for a synergy score.
 * The returned object contains classes used in SynergyScoreCard.
 */
export function getSynergyColor(score: number) {
  if (score >= 80) {
    return {
      bg: "bg-emerald-900",
      text: "text-emerald-300",
      border: "border-emerald-500",
      glow: "shadow-emerald-500/50",
    };
  }
  if (score >= 60) {
    return {
      bg: "bg-cyan-900",
      text: "text-cyan-300",
      border: "border-cyan-500",
      glow: "shadow-cyan-500/50",
    };
  }
  // low score
  return {
    bg: "bg-rose-900",
    text: "text-rose-300",
    border: "border-rose-500",
    glow: "shadow-rose-500/50",
  };
}

/**
 * Map a skill category to a Tailwind badge color.
 */
export function getCategoryBadgeColor(category: string) {
  const map: Record<string, string> = {
    frontend: "bg-cyan-500/20 text-cyan-300",
    backend: "bg-amber-500/20 text-amber-300",
    ai_ml: "bg-purple-500/20 text-purple-300",
    design: "bg-pink-500/20 text-pink-300",
    cloud_devops: "bg-indigo-500/20 text-indigo-300",
    mobile: "bg-teal-500/20 text-teal-300",
    hardware_iot: "bg-orange-500/20 text-orange-300",
    product_management: "bg-emerald-500/20 text-emerald-300",
  };
  return map[category] ?? "bg-slate-500/20 text-slate-300";
}

/**
 * Checks if a profile is publicly visible in marketplaces and public directories.
 * Returns true if isPublic is explicitly true.
 */
export function isProfilePubliclyVisible(profile: { isPublic?: boolean } | null | undefined): boolean {
  return Boolean(profile?.isPublic);
}

/**
 * Filters a list of student profiles for public marketplace listings.
 * Only profiles with isPublic === true are included, unless viewing user owns the profile.
 */
export function filterPublicProfiles<T extends { id: string; isPublic?: boolean }>(
  profiles: T[],
  currentUserId?: string
): T[] {
  return profiles.filter((p) => p.isPublic === true || (currentUserId && p.id === currentUserId));
}

