import { describe, it, expect } from "vitest";
import { isProfilePubliclyVisible, filterPublicProfiles } from "@/lib/utils";
import { StudentProfile } from "@/types";

describe("Profile Privacy & Marketplace Filtering", () => {
  const sampleProfiles: StudentProfile[] = [
    {
      id: "user-public-1",
      isPublic: true,
      fullName: "Alice Chen",
      university: "MIT",
      major: "Computer Science",
      graduationYear: 2025,
      headline: "Distributed Systems Researcher",
      availabilityHoursPerWeek: 20,
      preferredWorkStyle: "async",
      timezone: "EST",
      completedProjectsCount: 3,
      badges: [],
      skillsOffered: [
        { name: "Rust", category: "backend", proficiency: "expert", type: "offered" },
        { name: "Go", category: "backend", proficiency: "advanced", type: "offered" },
      ],
      skillsSeeking: [
        { name: "React", category: "frontend", proficiency: "intermediate", type: "seeking" },
      ],
    },
    {
      id: "user-private-2",
      isPublic: false,
      fullName: "Bob Vance",
      university: "Stanford",
      major: "Electrical Engineering",
      graduationYear: 2026,
      headline: "Robotics & Hardware Dev",
      availabilityHoursPerWeek: 10,
      preferredWorkStyle: "sync_intensive",
      timezone: "PST",
      completedProjectsCount: 1,
      badges: [],
      skillsOffered: [
        { name: "C++", category: "hardware_iot", proficiency: "expert", type: "offered" },
      ],
      skillsSeeking: [
        { name: "Python", category: "ai_ml", proficiency: "advanced", type: "seeking" },
      ],
    },
    {
      id: "user-public-3",
      isPublic: true,
      fullName: "Carol Danvers",
      university: "UC Berkeley",
      major: "Cognitive Science",
      graduationYear: 2027,
      headline: "Product Designer & UI Specialist",
      availabilityHoursPerWeek: 15,
      preferredWorkStyle: "hybrid",
      timezone: "PST",
      completedProjectsCount: 4,
      badges: [],
      skillsOffered: [
        { name: "Figma", category: "design", proficiency: "expert", type: "offered" },
      ],
      skillsSeeking: [
        { name: "Next.js", category: "frontend", proficiency: "intermediate", type: "seeking" },
      ],
    },
  ];

  describe("Privacy Visibility Controls", () => {
    it("recognizes public vs private profiles", () => {
      expect(isProfilePubliclyVisible(sampleProfiles[0])).toBe(true);
      expect(isProfilePubliclyVisible(sampleProfiles[1])).toBe(false);
      expect(isProfilePubliclyVisible(null)).toBe(false);
      expect(isProfilePubliclyVisible(undefined)).toBe(false);
      expect(isProfilePubliclyVisible({ isPublic: false })).toBe(false);
    });

    it("filters out private profiles for anonymous/external viewers", () => {
      const publicList = filterPublicProfiles(sampleProfiles);
      expect(publicList.length).toBe(2);
      expect(publicList.map((p) => p.id)).toEqual(["user-public-1", "user-public-3"]);
      expect(publicList.find((p) => p.id === "user-private-2")).toBeUndefined();
    });

    it("allows a private profile owner to view their own profile in results", () => {
      const viewerId = "user-private-2";
      const listForBob = filterPublicProfiles(sampleProfiles, viewerId);
      expect(listForBob.length).toBe(3);
      expect(listForBob.find((p) => p.id === "user-private-2")).toBeDefined();
    });
  });

  describe("Marketplace Search & Filter Logic", () => {
    it("filters students by search query across name, university, and skills", () => {
      const query = "mit";
      const matches = sampleProfiles.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.university.toLowerCase().includes(query) ||
          p.skillsOffered.some((s) => s.name.toLowerCase().includes(query))
      );
      expect(matches.length).toBe(1);
      expect(matches[0].fullName).toBe("Alice Chen");
    });

    it("filters students by skill name search", () => {
      const query = "rust";
      const matches = sampleProfiles.filter((p) =>
        p.skillsOffered.some((s) => s.name.toLowerCase().includes(query.toLowerCase()))
      );
      expect(matches.length).toBe(1);
      expect(matches[0].fullName).toBe("Alice Chen");
    });

    it("filters students by skill category", () => {
      const targetCategory = "design";
      const matches = sampleProfiles.filter((p) =>
        p.skillsOffered.some((s) => s.category === targetCategory)
      );
      expect(matches.length).toBe(1);
      expect(matches[0].fullName).toBe("Carol Danvers");
    });

    it("filters students by availability threshold", () => {
      const minHours = 15;
      const matches = sampleProfiles.filter(
        (p) => (p.availabilityHoursPerWeek ?? 0) >= minHours
      );
      expect(matches.length).toBe(2);
      expect(matches.map((p) => p.id)).toContain("user-public-1");
      expect(matches.map((p) => p.id)).toContain("user-public-3");
    });
  });
});
