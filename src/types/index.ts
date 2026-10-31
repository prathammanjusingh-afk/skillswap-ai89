export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'ai_ml'
  | 'design'
  | 'cloud_devops'
  | 'mobile'
  | 'hardware_iot'
  | 'product_management'
  | 'data_science'
  | 'cybersecurity'
  | 'languages'
  | 'other';

export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillItem {
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  proficiencyLevel?: number; // 1 to 5 scale
  type: 'offered' | 'seeking';
}

export type WorkStyle = 'async' | 'hybrid' | 'sync_intensive';

export type LearningPreference = 'online' | 'in_person' | 'both';

export type ProjectStage = 'ideation' | 'prototype' | 'in_progress' | 'polishing';

export type ProjectType = 'hackathon' | 'capstone' | 'startup_mvp' | 'open_source' | 'research';

export interface StudentProfile {
  id: string;
  email?: string;
  fullName: string;
  avatarUrl: string;
  headline: string;
  university: string;
  major: string;
  graduationYear: number;
  bio: string;
  availabilityHoursPerWeek: number;
  preferredWorkStyle: WorkStyle;
  learningPreference?: LearningPreference;
  timezone: string;
  interests?: string[];
  learningGoals?: string[];
  skillsOffered: SkillItem[];
  skillsSeeking: SkillItem[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  completedProjectsCount: number;
  completedSessionsCount?: number;
  badges: string[];
  role?: 'student' | 'admin' | 'moderator';
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
  skillComplementScore: number; // 35%
  interestsScore: number; // 25%
  timeCommitmentScore: number; // 15%
  goalAlignmentScore: number; // 15%
  experienceScore: number; // 10%
  workStyleScore: number;
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
  proposedSchedule?: string;
  synergyScore: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

export interface ExchangeSession {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerUniversity: string;
  skillToLearn: string;
  skillToTeach: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'scheduled' | 'rescheduled' | 'completed' | 'cancelled';
  meetingType: LearningPreference;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type:
    | 'request_received'
    | 'request_accepted'
    | 'request_declined'
    | 'new_message'
    | 'session_scheduled'
    | 'session_reminder';
  title: string;
  message: string;
  linkTab?: string;
  read: boolean;
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
