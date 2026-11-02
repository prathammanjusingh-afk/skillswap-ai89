import { supabase } from "@/lib/supabase/client";
import { StudentProfile } from "@/types";

/**
 * Maps a row from public.profiles to our StudentProfile interface.
 * Strictly defaults isPublic to false and role to verified role.
 */
export function mapDbProfileToStudentProfile(
  dbRow: any,
  authEmail?: string,
  rawMeta?: any,
  verifiedRole: "student" | "admin" | "moderator" = "student"
): StudentProfile {
  return {
    id: dbRow.id,
    email: authEmail || dbRow.email,
    fullName: dbRow.full_name || rawMeta?.full_name || "Student Innovator",
    avatarUrl:
      dbRow.avatar_url ||
      rawMeta?.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        dbRow.full_name || "User"
      )}`,
    headline:
      dbRow.headline ||
      rawMeta?.headline ||
      "Student Innovator @ SkillSwap AI",
    university: dbRow.university || rawMeta?.university || "Campus University",
    major: dbRow.major || "Computer Science",
    graduationYear: dbRow.graduation_year || 2026,
    bio:
      dbRow.bio ||
      rawMeta?.bio ||
      "Passionate about reciprocal skill learning and building projects.",
    availabilityHoursPerWeek: dbRow.availability_hours_per_week ?? 15,
    preferredWorkStyle: dbRow.preferred_work_style || "hybrid",
    learningPreference: "both",
    timezone: dbRow.timezone || "EST (UTC-5)",
    interests: ["Web Development", "AI/ML"],
    learningGoals: ["Deploy Full-Stack AI"],
    completedProjectsCount: 0,
    completedSessionsCount: 0,
    badges: ["Verified Student"],
    isPublic: Boolean(dbRow.is_public), // defaults to false
    githubUrl: dbRow.github_url || undefined,
    linkedinUrl: dbRow.linkedin_url || undefined,
    portfolioUrl: dbRow.portfolio_url || undefined,
    skillsOffered: [],
    skillsSeeking: [],
    role: verifiedRole,
  };
}

/**
 * Fetches the user profile from Supabase profiles table, or creates it if it doesn't exist yet.
 * Ensures profile ID strictly equals authUser.id, isPublic is false by default,
 * and role is verified against public.admin_roles table.
 */
export async function getOrCreateProfile(authUser: {
  id: string;
  email?: string;
  user_metadata?: any;
}): Promise<StudentProfile | null> {
  if (!supabase) return null;

  try {
    // 0. Verify admin roles from public.admin_roles table
    let verifiedRole: "student" | "admin" | "moderator" = "student";
    try {
      const { data: roleRow, error: roleError } = await supabase
        .from("admin_roles")
        .select("role")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (!roleError && roleRow?.role) {
        if (roleRow.role === "admin" || roleRow.role === "super_admin") {
          verifiedRole = "admin";
        } else if (roleRow.role === "moderator") {
          verifiedRole = "moderator";
        }
      }
    } catch {
      // Non-fatal if table not yet migrated
    }

    // 1. Try fetching existing profile from database
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existingProfile && !fetchError) {
      // Also fetch user's skills
      const { data: skillsData } = await supabase
        .from("profile_skills")
        .select("*")
        .eq("profile_id", authUser.id);

      const profile = mapDbProfileToStudentProfile(
        existingProfile,
        authUser.email,
        authUser.user_metadata,
        verifiedRole
      );

      if (skillsData && skillsData.length > 0) {
        profile.skillsOffered = skillsData
          .filter((s: any) => s.skill_type === "offered")
          .map((s: any) => ({
            name: s.skill_name,
            category: s.category,
            proficiency: s.proficiency || "intermediate",
            type: "offered" as const,
          }));

        profile.skillsSeeking = skillsData
          .filter((s: any) => s.skill_type === "seeking")
          .map((s: any) => ({
            name: s.skill_name,
            category: s.category,
            proficiency: s.proficiency || "intermediate",
            type: "seeking" as const,
          }));
      }

      return profile;
    }

    // 2. Profile not found or trigger hasn't fired yet; create it safely
    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.email?.split("@")[0] ||
      "Student Innovator";
    const university =
      authUser.user_metadata?.university || "Campus University";
    const primarySkill = authUser.user_metadata?.primary_skill;

    const newProfileInsert = {
      id: authUser.id,
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        fullName
      )}`,
      headline: `Student Innovator @ ${university}`,
      university: university,
      major: "Computer Science",
      graduation_year: new Date().getFullYear() + 2,
      bio: "Excited to collaborate and swap skills with fellow students.",
      availability_hours_per_week: 15,
      preferred_work_style: "hybrid",
      timezone: "EST (UTC-5)",
      is_public: false, // Default new profiles strictly to private
    };

    const { data: insertedData, error: insertError } = await supabase
      .from("profiles")
      .upsert(newProfileInsert, { onConflict: "id" })
      .select("*")
      .single();

    if (!insertError && insertedData) {
      if (primarySkill) {
        try {
          await supabase.from("profile_skills").upsert({
            profile_id: authUser.id,
            skill_name: primarySkill,
            category: "frontend",
            proficiency: "intermediate",
            skill_type: "offered",
          });
        } catch {
          // non-fatal
        }
      }

      return mapDbProfileToStudentProfile(
        insertedData,
        authUser.email,
        authUser.user_metadata,
        verifiedRole
      );
    }

    // Fallback if direct profile table write is blocked or schema differs:
    // construct profile using auth metadata with isPublic strictly false
    return {
      id: authUser.id,
      email: authUser.email,
      fullName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        fullName
      )}`,
      headline: `Student Innovator @ ${university}`,
      university,
      major: "Computer Science",
      graduationYear: new Date().getFullYear() + 2,
      bio: "Excited to collaborate and swap skills with fellow students.",
      availabilityHoursPerWeek: 15,
      preferredWorkStyle: "hybrid",
      learningPreference: "both",
      timezone: "EST (UTC-5)",
      completedProjectsCount: 0,
      badges: ["Verified Student"],
      isPublic: false, // Default to private
      skillsOffered: primarySkill
        ? [
            {
              name: primarySkill,
              category: "frontend",
              proficiency: "intermediate",
              type: "offered",
            },
          ]
        : [],
      skillsSeeking: [],
      role: verifiedRole,
    };
  } catch (err) {
    console.error("[Auth] Error fetching or creating profile:", err);
    return null;
  }
}
