import { describe, it, expect } from "vitest";
import { mapDbProfileToStudentProfile } from "@/lib/supabase/auth-service";

describe("Authentication & Profile Security Mapping", () => {
  it("strictly defaults isPublic to false when db row is null or false", () => {
    const rawDbRow = {
      id: "usr-123",
      email: "student@university.edu",
      full_name: "Alice Innovator",
      is_public: false,
    };
    const profile = mapDbProfileToStudentProfile(rawDbRow);
    expect(profile.isPublic).toBe(false);

    const rawDbRowNull = {
      id: "usr-124",
      is_public: null,
    };
    const profileNull = mapDbProfileToStudentProfile(rawDbRowNull);
    expect(profileNull.isPublic).toBe(false);
  });

  it("assigns verified roles strictly and prevents role tampering", () => {
    const rawDbRow = {
      id: "usr-999",
      full_name: "Sneaky User",
      role: "admin", // attacker attempts to place role in public.profiles table
    };

    // By default, verifiedRole argument is 'student' unless validated from admin_roles
    const unverifiedProfile = mapDbProfileToStudentProfile(rawDbRow);
    expect(unverifiedProfile.role).toBe("student");

    // Only when verifiedRole is explicitly passed from admin_roles does it become admin
    const verifiedAdminProfile = mapDbProfileToStudentProfile(rawDbRow, undefined, undefined, "admin");
    expect(verifiedAdminProfile.role).toBe("admin");

    const verifiedModProfile = mapDbProfileToStudentProfile(rawDbRow, undefined, undefined, "moderator");
    expect(verifiedModProfile.role).toBe("moderator");
  });

  it("generates deterministic fallback avatar URL using initials when avatar_url is missing", () => {
    const rawDbRow = {
      id: "usr-456",
      full_name: "Jane Doe",
      avatar_url: null,
    };
    const profile = mapDbProfileToStudentProfile(rawDbRow);
    expect(profile.avatarUrl).toContain("https://api.dicebear.com/7.x/initials/svg?seed=Jane%20Doe");
  });

  it("prioritizes authenticated email over profile table email", () => {
    const rawDbRow = {
      id: "usr-789",
      email: "old_profile_email@domain.com",
    };
    const authEmail = "auth_verified@university.edu";
    const profile = mapDbProfileToStudentProfile(rawDbRow, authEmail);
    expect(profile.email).toBe(authEmail);
  });
});
