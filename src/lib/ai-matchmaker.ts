import { StudentProfile, SynergyBreakdown, Project, ProjectRole } from "@/types";

/**
 * Weights proficiency into numeric factor (0.45 to 1.0)
 */
function getProficiencyFactor(proficiency: string, level?: number): number {
  if (typeof level === "number" && level >= 1 && level <= 5) {
    return 0.2 * level;
  }
  switch (proficiency) {
    case "expert":
      return 1.0;
    case "advanced":
      return 0.85;
    case "intermediate":
      return 0.65;
    case "beginner":
    default:
      return 0.45;
  }
}

/**
 * Calculates real transparent synergy score between active student and a peer:
 * - Skill complementarity: 35%
 * - Shared project interests: 25%
 * - Availability compatibility: 15%
 * - Goal alignment: 15%
 * - Experience compatibility: 10%
 */
export function calculateStudentSynergy(
  currentUser: StudentProfile,
  targetStudent: StudentProfile
): SynergyBreakdown {
  if (currentUser.id === targetStudent.id) {
    return {
      overallScore: 100,
      skillComplementScore: 100,
      interestsScore: 100,
      timeCommitmentScore: 100,
      goalAlignmentScore: 100,
      experienceScore: 100,
      workStyleScore: 100,
      matchedSkills: [],
      complementaryHighlights: ["This is your active profile"],
      synergyLevel: "Exceptional",
    };
  }

  // 1. Skill Complementarity (35% weight)
  // Target skills offered that Current User seeks
  const mySeekingNames = currentUser.skillsSeeking.map((s) => s.name.toLowerCase());
  const peerOfferedMatches = targetStudent.skillsOffered.filter((s) =>
    mySeekingNames.some((needed) => needed === s.name.toLowerCase() || s.name.toLowerCase().includes(needed) || needed.includes(s.name.toLowerCase()))
  );

  // Current User skills offered that Target seeks (bilateral reciprocal bonus)
  const peerSeekingNames = targetStudent.skillsSeeking.map((s) => s.name.toLowerCase());
  const myOfferedMatches = currentUser.skillsOffered.filter((s) =>
    peerSeekingNames.some((needed) => needed === s.name.toLowerCase() || s.name.toLowerCase().includes(needed) || needed.includes(s.name.toLowerCase()))
  );

  let skillComplementScore = 40; // baseline
  if (peerOfferedMatches.length > 0) {
    const peerScore = peerOfferedMatches.reduce(
      (acc, s) => acc + getProficiencyFactor(s.proficiency, s.proficiencyLevel) * 25,
      0
    );
    skillComplementScore += Math.min(peerScore, 35);
  }
  if (myOfferedMatches.length > 0) {
    const myScore = myOfferedMatches.reduce(
      (acc, s) => acc + getProficiencyFactor(s.proficiency, s.proficiencyLevel) * 20,
      0
    );
    skillComplementScore += Math.min(myScore, 25);
  }
  skillComplementScore = Math.min(Math.round(skillComplementScore), 99);

  // 2. Shared Project Interests (25% weight)
  const myInterests = (currentUser.interests || []).map((i) => i.toLowerCase());
  const peerInterests = (targetStudent.interests || []).map((i) => i.toLowerCase());
  
  let sharedInterests = myInterests.filter((i) => peerInterests.includes(i));
  // If either doesn't have custom interests yet, compare major/domain alignment
  let interestsScore = 65;
  if (myInterests.length > 0 && peerInterests.length > 0) {
    const overlapRatio = sharedInterests.length / Math.max(1, Math.min(myInterests.length, peerInterests.length));
    interestsScore = Math.round(50 + overlapRatio * 48);
  } else if (currentUser.major && targetStudent.major) {
    const sameMajor = currentUser.major.toLowerCase() === targetStudent.major.toLowerCase();
    interestsScore = sameMajor ? 88 : 72;
  }

  // 3. Availability & Work Rhythm Compatibility (15% weight)
  const hourDiff = Math.abs(currentUser.availabilityHoursPerWeek - targetStudent.availabilityHoursPerWeek);
  let timeCommitmentScore = 95 - hourDiff * 3;
  if (currentUser.preferredWorkStyle === targetStudent.preferredWorkStyle) {
    timeCommitmentScore += 5;
  }
  timeCommitmentScore = Math.max(50, Math.min(100, Math.round(timeCommitmentScore)));

  // 4. Goal Alignment (15% weight)
  let goalAlignmentScore = 75;
  const myGoals = (currentUser.learningGoals || []).map((g) => g.toLowerCase());
  const targetCanTeachGoals = targetStudent.skillsOffered.filter((s) =>
    myGoals.some((g) => g.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(g))
  );
  if (targetCanTeachGoals.length > 0) {
    goalAlignmentScore += Math.min(20, targetCanTeachGoals.length * 10);
  }
  if (currentUser.university === targetStudent.university) {
    goalAlignmentScore += 5; // Campus sync bonus
  }
  goalAlignmentScore = Math.min(99, Math.round(goalAlignmentScore));

  // 5. Experience Compatibility (10% weight)
  const expDiff = Math.abs(currentUser.completedProjectsCount - targetStudent.completedProjectsCount);
  let experienceScore = Math.max(60, 95 - expDiff * 4);

  // Work Style Score (for display)
  let workStyleScore = 80;
  if (currentUser.preferredWorkStyle === targetStudent.preferredWorkStyle) {
    workStyleScore = 98;
  } else if (currentUser.preferredWorkStyle === "hybrid" || targetStudent.preferredWorkStyle === "hybrid") {
    workStyleScore = 88;
  } else {
    workStyleScore = 70;
  }

  // Final Transparent Weighted Formula:
  // 35% Skill + 25% Interests + 15% Availability + 15% Goals + 10% Experience
  const overallScore = Math.min(
    99,
    Math.max(
      45,
      Math.round(
        skillComplementScore * 0.35 +
        interestsScore * 0.25 +
        timeCommitmentScore * 0.15 +
        goalAlignmentScore * 0.15 +
        experienceScore * 0.10
      )
    )
  );

  // Generate transparent natural language explanations
  const complementaryHighlights: string[] = [];

  if (peerOfferedMatches.length > 0) {
    const names = peerOfferedMatches.map((s) => s.name).join(", ");
    complementaryHighlights.push(
      `Complementary Skillset: Can teach or build with ${names} to cover your learning needs.`
    );
  }

  if (myOfferedMatches.length > 0) {
    const names = myOfferedMatches.map((s) => s.name).join(", ");
    complementaryHighlights.push(
      `Reciprocal Swap: You can teach them your ${names} expertise in return.`
    );
  }

  if (sharedInterests.length > 0) {
    complementaryHighlights.push(
      `Shared Interests: Both excited about ${sharedInterests.slice(0, 3).join(", ")}.`
    );
  }

  if (hourDiff <= 4) {
    complementaryHighlights.push(
      `Aligned Availability: Compatible schedules (${targetStudent.availabilityHoursPerWeek} hrs/wk vs your ${currentUser.availabilityHoursPerWeek} hrs/wk).`
    );
  }

  let synergyLevel: 'Exceptional' | 'Strong' | 'Promising' | 'Moderate' = 'Moderate';
  if (overallScore >= 90) synergyLevel = 'Exceptional';
  else if (overallScore >= 80) synergyLevel = 'Strong';
  else if (overallScore >= 70) synergyLevel = 'Promising';

  const matchedSkills = Array.from(
    new Set([...peerOfferedMatches.map((s) => s.name), ...myOfferedMatches.map((s) => s.name)])
  );

  return {
    overallScore,
    skillComplementScore,
    interestsScore,
    timeCommitmentScore,
    goalAlignmentScore,
    experienceScore,
    workStyleScore,
    matchedSkills,
    complementaryHighlights,
    synergyLevel,
  };
}

/**
 * Calculates candidate match score for an open project role
 */
export function calculateProjectCandidateMatch(
  project: Project,
  role: ProjectRole,
  candidate: StudentProfile
): {
  score: number;
  matchedRoleSkills: string[];
  justification: string;
} {
  const candidateOfferedSkills = (candidate?.skillsOffered || []).map((s) => s.name.toLowerCase());
  const requiredSkills = Array.isArray(role?.requiredSkills) ? role.requiredSkills : [];
  const matched = requiredSkills.filter((req) =>
    candidateOfferedSkills.some((offered) => offered === req.toLowerCase() || offered.includes(req.toLowerCase()))
  );

  const skillMatchRatio = requiredSkills.length > 0 ? matched.length / requiredSkills.length : 0.8;
  const weeklyHours = project?.weeklyHoursRequired ?? 10;
  const candidateHours = candidate?.availabilityHoursPerWeek ?? 10;
  const hourDiff = Math.abs(candidateHours - weeklyHours);
  const timeFactor = Math.max(0.6, 1.0 - hourDiff * 0.05);

  const score = Math.min(99, Math.round((skillMatchRatio * 75 + timeFactor * 25)));

  let justification = "";
  if (requiredSkills.length > 0 && matched.length === requiredSkills.length) {
    justification = `Complete 100% skill coverage for ${role?.title || "role"} (${matched.join(", ")}).`;
  } else if (matched.length > 0) {
    justification = `Strong alignment on ${matched.join(", ")} with ${candidateHours}h weekly focus.`;
  } else {
    justification = `Adjacent foundation with fast onboarding potential in ${candidate?.major || "field"}.`;
  }

  return {
    score,
    matchedRoleSkills: matched,
    justification,
  };
}

/**
 * Calculates team skill coverage across key engineering and product disciplines
 */
export function calculateTeamSkillCoverage(members: StudentProfile[]): {
  frontend: number;
  backend: number;
  ai_ml: number;
  design: number;
  devops: number;
} {
  const coverage = {
    frontend: 0,
    backend: 0,
    ai_ml: 0,
    design: 0,
    devops: 0,
  };

  members.forEach((m) => {
    m.skillsOffered.forEach((skill) => {
      const weight = getProficiencyFactor(skill.proficiency, skill.proficiencyLevel) * 35;
      if (skill.category === "frontend") coverage.frontend = Math.min(100, coverage.frontend + weight);
      if (skill.category === "backend") coverage.backend = Math.min(100, coverage.backend + weight);
      if (skill.category === "ai_ml") coverage.ai_ml = Math.min(100, coverage.ai_ml + weight);
      if (skill.category === "design") coverage.design = Math.min(100, coverage.design + weight);
      if (skill.category === "cloud_devops") coverage.devops = Math.min(100, coverage.devops + weight);
    });
  });

  return {
    frontend: Math.round(coverage.frontend),
    backend: Math.round(coverage.backend),
    ai_ml: Math.round(coverage.ai_ml),
    design: Math.round(coverage.design),
    devops: Math.round(coverage.devops),
  };
}

/**
 * Generates an optimal 3-4 person Dream Team based on project requirements
 */
export function generateDreamTeamRecommendation(
  targetProject?: Project | null,
  availableStudents: StudentProfile[] = []
) {
  const emptyResult = {
    projectId: targetProject?.id || "",
    suggestedCandidates: [] as {
      student: StudentProfile;
      targetRole: string;
      synergyScore: number;
      skillsFilled: string[];
      justification: string;
    }[],
    overallTeamCoverage: {
      frontend: 0,
      backend: 0,
      ai_ml: 0,
      design: 0,
      devops: 0,
    },
  };

  if (!targetProject || !Array.isArray(targetProject.openRoles) || targetProject.openRoles.length === 0) {
    return emptyResult;
  }

  const teamRecommendations: {
    student: StudentProfile;
    targetRole: string;
    synergyScore: number;
    skillsFilled: string[];
    justification: string;
  }[] = [];

  const unassignedStudents = [...(availableStudents || [])];

  for (const role of targetProject.openRoles) {
    if (!role || role.isFilled || unassignedStudents.length === 0) continue;

    let bestStudentIndex = -1;
    let highestScore = -1;
    let bestMatchDetails = {
      matchedRoleSkills: [] as string[],
      justification: "",
    };

    unassignedStudents.forEach((candidate, idx) => {
      const match = calculateProjectCandidateMatch(targetProject, role, candidate);
      if (match.score > highestScore) {
        highestScore = match.score;
        bestStudentIndex = idx;
        bestMatchDetails = match;
      }
    });

    if (bestStudentIndex !== -1) {
      const selectedStudent = unassignedStudents[bestStudentIndex];
      teamRecommendations.push({
        student: selectedStudent,
        targetRole: role.title || "Core Contributor",
        synergyScore: highestScore,
        skillsFilled: bestMatchDetails.matchedRoleSkills,
        justification: bestMatchDetails.justification,
      });
      unassignedStudents.splice(bestStudentIndex, 1);
    }
  }

  const simulatedTeam = teamRecommendations.map((r) => r.student);
  const overallTeamCoverage = calculateTeamSkillCoverage(simulatedTeam);

  return {
    projectId: targetProject.id,
    suggestedCandidates: teamRecommendations,
    overallTeamCoverage,
  };
}
