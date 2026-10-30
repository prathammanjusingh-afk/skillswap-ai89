import { StudentProfile, SynergyBreakdown, Project, ProjectRole } from "@/types";

/**
 * Weights proficiency into numeric factor (0.45 to 1.0)
 */
function getProficiencyWeight(proficiency: string): number {
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
 * Calculates bilateral synergy between active student user and a target peer student
 */
export function calculateStudentSynergy(
  currentUser: StudentProfile,
  targetStudent: StudentProfile
): SynergyBreakdown {
  if (currentUser.id === targetStudent.id) {
    return {
      overallScore: 100,
      skillComplementScore: 100,
      goalAlignmentScore: 100,
      workStyleScore: 100,
      timeCommitmentScore: 100,
      matchedSkills: [],
      complementaryHighlights: ["This is your active profile"],
      synergyLevel: "Exceptional",
    };
  }

  // 1. Bilateral Complementarity:
  // How many skills TARGET offers that CURRENT USER seeks?
  const mySeekingNames = currentUser.skillsSeeking.map((s) => s.name.toLowerCase());
  const peerOfferedMatches = targetStudent.skillsOffered.filter((s) =>
    mySeekingNames.some((needed) => needed === s.name.toLowerCase() || s.name.toLowerCase().includes(needed))
  );

  // How many skills CURRENT USER offers that TARGET seeks?
  const peerSeekingNames = targetStudent.skillsSeeking.map((s) => s.name.toLowerCase());
  const myOfferedMatches = currentUser.skillsOffered.filter((s) =>
    peerSeekingNames.some((needed) => needed === s.name.toLowerCase() || s.name.toLowerCase().includes(needed))
  );

  // Skill Score Calculation
  let skillComplementScore = 50; // base baseline
  if (peerOfferedMatches.length > 0) {
    const peerScore =
      peerOfferedMatches.reduce((acc, s) => acc + getProficiencyWeight(s.proficiency) * 20, 0);
    skillComplementScore += Math.min(peerScore, 30);
  }
  if (myOfferedMatches.length > 0) {
    const myScore =
      myOfferedMatches.reduce((acc, s) => acc + getProficiencyWeight(s.proficiency) * 20, 0);
    skillComplementScore += Math.min(myScore, 20);
  }
  skillComplementScore = Math.min(Math.round(skillComplementScore), 99);

  // 2. Time Commitment Compatibility
  const hourDiff = Math.abs(currentUser.availabilityHoursPerWeek - targetStudent.availabilityHoursPerWeek);
  let timeCommitmentScore = 95 - hourDiff * 3;
  timeCommitmentScore = Math.max(50, Math.min(100, timeCommitmentScore));

  // 3. Work Style Alignment
  let workStyleScore = 80;
  if (currentUser.preferredWorkStyle === targetStudent.preferredWorkStyle) {
    workStyleScore = 98;
  } else if (
    (currentUser.preferredWorkStyle === "hybrid" && targetStudent.preferredWorkStyle !== "hybrid") ||
    (targetStudent.preferredWorkStyle === "hybrid" && currentUser.preferredWorkStyle !== "hybrid")
  ) {
    workStyleScore = 88;
  } else {
    workStyleScore = 68; // async vs sync_intensive
  }

  // 4. Goal Alignment (University & experience level)
  let goalAlignmentScore = 82;
  if (currentUser.university === targetStudent.university) {
    goalAlignmentScore += 8; // same campus bonus for in-person sync
  }
  if (Math.abs(currentUser.graduationYear - targetStudent.graduationYear) <= 1) {
    goalAlignmentScore += 6;
  }
  goalAlignmentScore = Math.min(goalAlignmentScore, 98);

  // Overall Weighted Score
  // 50% skill complementarity + 20% availability + 15% work style + 15% goal alignment
  const overallScore = Math.round(
    skillComplementScore * 0.5 +
      timeCommitmentScore * 0.2 +
      workStyleScore * 0.15 +
      goalAlignmentScore * 0.15
  );

  // Human-readable AI highlights
  const complementaryHighlights: string[] = [];

  if (peerOfferedMatches.length > 0) {
    const names = peerOfferedMatches.map((s) => s.name).join(", ");
    complementaryHighlights.push(
      `Fills your missing stack with expert ${names} capabilities.`
    );
  }

  if (myOfferedMatches.length > 0) {
    const names = myOfferedMatches.map((s) => s.name).join(", ");
    complementaryHighlights.push(
      `Reciprocal match: They are actively seeking your ${names} skillset.`
    );
  }

  if (hourDiff <= 4) {
    complementaryHighlights.push(
      `Synchronized availability (~${targetStudent.availabilityHoursPerWeek}h vs your ${currentUser.availabilityHoursPerWeek}h/wk) ensures balanced sprint workload.`
    );
  }

  if (currentUser.preferredWorkStyle === targetStudent.preferredWorkStyle) {
    complementaryHighlights.push(
      `Mutual preference for ${currentUser.preferredWorkStyle.toUpperCase()} working rhythm reduces communication friction.`
    );
  } else {
    complementaryHighlights.push(
      `Compatible collaboration styles (${currentUser.preferredWorkStyle} & ${targetStudent.preferredWorkStyle}).`
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
    goalAlignmentScore,
    workStyleScore,
    timeCommitmentScore,
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
  const candidateOfferedSkills = candidate.skillsOffered.map((s) => s.name.toLowerCase());
  const matched = role.requiredSkills.filter((req) =>
    candidateOfferedSkills.some((offered) => offered === req.toLowerCase() || offered.includes(req.toLowerCase()))
  );

  const skillMatchRatio = role.requiredSkills.length > 0 ? matched.length / role.requiredSkills.length : 0.8;
  const hourDiff = Math.abs(candidate.availabilityHoursPerWeek - project.weeklyHoursRequired);
  const timeFactor = Math.max(0.6, 1.0 - hourDiff * 0.05);

  const score = Math.min(99, Math.round((skillMatchRatio * 75 + timeFactor * 25)));

  let justification = "";
  if (matched.length === role.requiredSkills.length) {
    justification = `Complete 100% skill coverage for ${role.title} (${matched.join(", ")}).`;
  } else if (matched.length > 0) {
    justification = `Strong alignment on ${matched.join(", ")} with ${candidate.availabilityHoursPerWeek}h weekly focus.`;
  } else {
    justification = `Adjacent foundation with fast onboarding potential in ${candidate.major}.`;
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
      const weight = getProficiencyWeight(skill.proficiency) * 35;
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
  targetProject: Project,
  availableStudents: StudentProfile[]
) {
  const teamRecommendations: {
    student: StudentProfile;
    targetRole: string;
    synergyScore: number;
    skillsFilled: string[];
    justification: string;
  }[] = [];

  const unassignedStudents = [...availableStudents];

  for (const role of targetProject.openRoles) {
    if (role.isFilled || unassignedStudents.length === 0) continue;

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
        targetRole: role.title,
        synergyScore: highestScore,
        skillsFilled: bestMatchDetails.matchedRoleSkills,
        justification: bestMatchDetails.justification,
      });
      // Remove selected student so they are not assigned to multiple roles
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
