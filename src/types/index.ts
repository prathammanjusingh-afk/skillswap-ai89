export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'ai_ml'
  | 'design'
  | 'cloud_devops'
  | 'mobile'
  | 'hardware_iot'
  | 'product_management';

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillItem {
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  type: 'offered' | 'seeking';
}

export type WorkStyle = 'async' | 'hybrid' | 'sync_intensive';

export type ProjectStage = 'ideation' | 'prototype' | 'in_progress' | 'polishing';

export type ProjectType = 'hackathon' | 'capstone' | 'startup_mvp' | 'open_source' | 'research';

export interface StudentProfile {
  id: string;
  fullName: string;
  avatarUrl: string;
  headline: string;
  university: string;
  major: string;
  graduationYear: number;
  bio: string;
  availabilityHoursPerWeek: number;
  preferredWorkStyle: WorkStyle;
  timezone: string;
  skillsOffered: SkillItem[];
  skillsSeeking: SkillItem[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  completedProjectsCount: number;
  badges: string[];
}

export interface ProjectRole {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  isFilled: boolean;
  filledByProfileId?: string;
  filledByName?: string;
}

export interface Project {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  creatorUniversity: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  projectType: ProjectType;
  stage: ProjectStage;
  targetEvent?: string;
  weeklyHoursRequired: number;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  status: 'recruiting' | 'in_progress' | 'completed';
  openRoles: ProjectRole[];
  currentTeamSize: number;
  maxTeamSize: number;
  createdAt: string;
}

export interface SynergyBreakdown {
  overallScore: number; // 0 - 100
  skillComplementScore: number; // 0 - 100 (complementarity between what A seeks and B offers)
  goalAlignmentScore: number; // 0 - 100
  workStyleScore: number; // 0 - 100
  timeCommitmentScore: number; // 0 - 100
  matchedSkills: string[]; // Skills student offers that match what target needs
  complementaryHighlights: string[]; // AI reasoned explanation points
  synergyLevel: 'Exceptional' | 'Strong' | 'Promising' | 'Moderate';
}

export interface CollaborationRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderHeadline: string;
  senderUniversity: string;
  receiverId?: string;
  receiverName?: string;
  projectId?: string;
  projectTitle?: string;
  requestType: 'skill_swap_invite' | 'project_application' | 'team_invitation';
  pitchMessage: string;
  synergyScore: number;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface TeamRecommendation {
  projectId: string;
  suggestedCandidates: {
    student: StudentProfile;
    targetRole: string;
    synergyScore: number;
    skillsFilled: string[];
    justification: string;
  }[];
  overallTeamCoverage: {
    frontend: number;
    backend: number;
    ai_ml: number;
    design: number;
    devops: number;
  };
}
