import { describe, it, expect } from "vitest";
import {
  calculateStudentSynergy,
  calculateProjectCandidateMatch,
  calculateTeamSkillCoverage,
  generateDreamTeamRecommendation,
} from "@/lib/ai-matchmaker";
import { MOCK_CURRENT_USER, MOCK_STUDENTS } from "@/lib/mock-data";
import { Project, ProjectRole } from "@/types";

describe("AI Matchmaker - Transparent Heuristic Algorithms", () => {
  it("calculates exact 100% self-synergy for identical profile", () => {
    const result = calculateStudentSynergy(MOCK_CURRENT_USER, MOCK_CURRENT_USER);
    expect(result.overallScore).toBe(100);
    expect(result.synergyLevel).toBe("Exceptional");
    expect(result.complementaryHighlights).toContain("This is your active profile");
  });

  it("calculates multi-factor synergy for distinct peers", () => {
    const peer = MOCK_STUDENTS[0]; // Priya (AI & LLM researcher)
    const result = calculateStudentSynergy(MOCK_CURRENT_USER, peer);

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.skillComplementScore).toBeGreaterThanOrEqual(0);
    expect(result.interestsScore).toBeGreaterThanOrEqual(0);
    expect(result.timeCommitmentScore).toBeGreaterThanOrEqual(0);
    expect(result.goalAlignmentScore).toBeGreaterThanOrEqual(0);
    expect(result.workStyleScore).toBeGreaterThanOrEqual(0);
    expect(["Exceptional", "Strong", "Moderate", "Emerging"]).toContain(result.synergyLevel);
  });

  it("calculates project role candidate match score", () => {
    const candidate = MOCK_STUDENTS[0];
    const role: ProjectRole = {
      id: "role-1",
      title: "AI Engineer",
      requiredSkills: ["PyTorch", "Python", "FastAPI"],
      proficiencyLevel: "advanced",
      hoursPerWeek: 15,
      description: "Build LLM pipelines",
      isFilled: false,
    };
    const project: Project = {
      id: "proj-1",
      creatorId: "user-current-alex",
      title: "AI Project",
      tagline: "Building agents",
      description: "Agents platform",
      category: "ai_ml",
      projectType: "hackathon",
      stage: "prototype",
      weeklyHoursRequired: 15,
      tags: ["AI", "Agents"],
      status: "recruiting",
      openRoles: [role],
      teamMembers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const match = calculateProjectCandidateMatch(project, role, candidate);
    expect(match.score).toBeGreaterThanOrEqual(0);
    expect(match.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(match.matchedRoleSkills)).toBe(true);
    expect(typeof match.justification).toBe("string");
  });

  it("calculates team skill coverage across diverse members", () => {
    const members = [MOCK_CURRENT_USER, MOCK_STUDENTS[0]];
    const coverage = calculateTeamSkillCoverage(members);

    expect(coverage.frontend).toBeGreaterThanOrEqual(0);
    expect(coverage.backend).toBeGreaterThanOrEqual(0);
    expect(coverage.ai_ml).toBeGreaterThanOrEqual(0);
    expect(coverage.design).toBeGreaterThanOrEqual(0);
    expect(coverage.devops).toBeGreaterThanOrEqual(0);
    expect(coverage.frontend + coverage.ai_ml).toBeGreaterThan(0);
  });

  it("generates dream team recommendations for project roles", () => {
    const roles: ProjectRole[] = [
      {
        id: "role-ai",
        title: "AI Specialist",
        requiredSkills: ["PyTorch", "FastAPI"],
        proficiencyLevel: "advanced",
        hoursPerWeek: 15,
        description: "Develop ML models",
        isFilled: false,
      },
      {
        id: "role-design",
        title: "Product Designer",
        requiredSkills: ["Figma", "Design"],
        proficiencyLevel: "intermediate",
        hoursPerWeek: 10,
        description: "Design UI flows",
        isFilled: false,
      },
    ];

    const project: Project = {
      id: "proj-dream",
      creatorId: "user-current-alex",
      title: "Campus AI Hackathon",
      tagline: "Collaborative Intelligence",
      description: "Hackathon project",
      category: "ai_ml",
      projectType: "hackathon",
      stage: "ideation",
      weeklyHoursRequired: 15,
      tags: ["Hackathon", "AI"],
      status: "recruiting",
      openRoles: roles,
      teamMembers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const team = generateDreamTeamRecommendation(project, MOCK_STUDENTS);
    expect(team).toBeDefined();
    expect(team.projectId).toBe(project.id);
    expect(Array.isArray(team.suggestedCandidates)).toBe(true);
    expect(team.suggestedCandidates.length).toBeGreaterThan(0);
    team.suggestedCandidates.forEach((assignment) => {
      expect(assignment.student).toBeDefined();
      expect(assignment.targetRole).toBeDefined();
      expect(assignment.synergyScore).toBeGreaterThanOrEqual(0);
    });
    expect(team.overallTeamCoverage).toBeDefined();
  });
});
