"use client";

import React, { useState, useEffect } from "react";
import {
  StudentProfile,
  Project,
  CollaborationRequest,
  SynergyBreakdown,
} from "@/types";
import {
  MOCK_CURRENT_USER,
  MOCK_STUDENTS,
  MOCK_PROJECTS,
  MOCK_REQUESTS,
} from "@/lib/mock-data";
import {
  loadStoredCurrentUser,
  saveStoredCurrentUser,
  loadStoredStudents,
  saveStoredStudents,
  loadStoredProjects,
  saveStoredProjects,
  loadStoredRequests,
  saveStoredRequests,
} from "@/lib/storage";
import { calculateStudentSynergy } from "@/lib/ai-matchmaker";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StudentCard } from "@/components/students/StudentCard";
import { StudentDetailModal } from "@/components/students/StudentDetailModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TeamGapAnalyzerModal } from "@/components/ai/TeamGapAnalyzerModal";
import { TeamBuilderStudio } from "@/components/ai/TeamBuilderStudio";
import { CollabHub } from "@/components/workspace/CollabHub";
import { SkillProfileEditor } from "@/components/profile/SkillProfileEditor";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Search,
  Rocket,
  Users,
  LayoutDashboard,
} from "lucide-react";

export default function HomePage() {
  // Hydration guard: use null until client-side storage is loaded
  const [hydrated, setHydrated] = useState(false);

  // Active Persona State — loaded from localStorage on mount
  const [currentUser, setCurrentUser] = useState<StudentProfile>(MOCK_CURRENT_USER);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Data Collections — loaded from localStorage on mount
  const [students, setStudents] = useState<StudentProfile[]>(MOCK_STUDENTS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [requests, setRequests] = useState<CollaborationRequest[]>(MOCK_REQUESTS);

  // Hydrate from localStorage on first mount (client only)
  useEffect(() => {
    const storedUser = loadStoredCurrentUser();
    const storedStudents = loadStoredStudents();
    const storedProjects = loadStoredProjects();
    const storedRequests = loadStoredRequests();

    setCurrentUser(storedUser);
    setStudents(storedStudents);
    setProjects(storedProjects);
    setRequests(storedRequests);
    setHydrated(true);
  }, []);

  // Persist changes to localStorage whenever state updates (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveStoredCurrentUser(currentUser);
  }, [currentUser, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredStudents(students);
  }, [students, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredProjects(projects);
  }, [projects, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredRequests(requests);
  }, [requests, hydrated]);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minSynergyFilter, setMinSynergyFilter] = useState<number>(60);
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");

  // Modal States
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<StudentProfile | null>(null);
  const [selectedStudentSynergy, setSelectedStudentSynergy] = useState<SynergyBreakdown | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [preselectedRoleId, setPreselectedRoleId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const [gapAnalyzerProject, setGapAnalyzerProject] = useState<Project | null>(null);
  const [isGapAnalyzerModalOpen, setIsGapAnalyzerModalOpen] = useState(false);

  // Available personas to test reciprocal matchmaking
  const availablePersonas = [
    MOCK_CURRENT_USER,
    MOCK_STUDENTS[0], // Priya Sharma (AI/ML @ Stanford)
    MOCK_STUDENTS[1], // Marcus Chen (Backend @ MIT)
    MOCK_STUDENTS[2], // Elena Rostova (UI/UX @ CMU)
  ];

  const handleSwitchPersona = (persona: StudentProfile) => {
    setCurrentUser(persona);
  };

  // Student Modal Handlers
  const handleOpenStudentDetail = (student: StudentProfile, synergy: SynergyBreakdown) => {
    setSelectedStudentForModal(student);
    setSelectedStudentSynergy(synergy);
    setIsStudentModalOpen(true);
  };

  const handleOpenSwapFromCard = (student: StudentProfile, synergy: SynergyBreakdown) => {
    setSelectedStudentForModal(student);
    setSelectedStudentSynergy(synergy);
    setIsStudentModalOpen(true);
  };

  const handleSendSwapProposal = (receiverId: string, pitchMessage: string) => {
    const receiver = students.find((s) => s.id === receiverId);
    if (!receiver) return;

    const synergy = calculateStudentSynergy(currentUser, receiver);

    const newReq: CollaborationRequest = {
      id: `req-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderHeadline: currentUser.headline,
      senderUniversity: currentUser.university,
      receiverId: receiver.id,
      receiverName: receiver.fullName,
      requestType: "skill_swap_invite",
      pitchMessage,
      synergyScore: synergy.overallScore,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
  };

  // Project Modal Handlers
  const handleOpenProjectDetail = (project: Project) => {
    setSelectedProjectForModal(project);
    setPreselectedRoleId(null);
    setIsProjectModalOpen(true);
  };

  const handleApplyToProjectRole = (project: Project, roleId: string) => {
    setSelectedProjectForModal(project);
    setPreselectedRoleId(roleId);
    setIsProjectModalOpen(true);
  };

  const handleApplySubmission = (projectId: string, roleTitle: string, pitch: string) => {
    const targetProj = projects.find((p) => p.id === projectId);
    if (!targetProj) return;

    const newReq: CollaborationRequest = {
      id: `req-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderHeadline: currentUser.headline,
      senderUniversity: currentUser.university,
      receiverId: targetProj.creatorId,
      receiverName: targetProj.creatorName,
      projectId: targetProj.id,
      projectTitle: targetProj.title,
      requestType: "project_application",
      pitchMessage: `[Applying for ${roleTitle}]: ${pitch}`,
      synergyScore: 92,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleOpenGapAnalyzer = (project: Project) => {
    setGapAnalyzerProject(project);
    setIsGapAnalyzerModalOpen(true);
  };

  const handleInviteFromGapAnalyzer = (studentId: string, roleTitle: string, projectId: string) => {
    const student = students.find((s) => s.id === studentId);
    const targetProj = projects.find((p) => p.id === projectId);
    if (!student || !targetProj) return;

    const newReq: CollaborationRequest = {
      id: `req-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      senderHeadline: currentUser.headline,
      senderUniversity: currentUser.university,
      receiverId: student.id,
      receiverName: student.fullName,
      projectId: targetProj.id,
      projectTitle: targetProj.title,
      requestType: "team_invitation",
      pitchMessage: `Hey ${student.fullName}, we ran our AI Team Gap Analyzer on "${targetProj.title}" and your profile is an ideal match for our open ${roleTitle} position!`,
      synergyScore: 95,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);
  };

  const handleBatchInvitesFromDreamTeam = (studentIds: string[], projectTitle: string) => {
    const newBatch: CollaborationRequest[] = studentIds.map((id) => {
      const student = students.find((s) => s.id === id);
      return {
        id: `req-${Date.now()}-${id}`,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderAvatar: currentUser.avatarUrl,
        senderHeadline: currentUser.headline,
        senderUniversity: currentUser.university,
        receiverId: id,
        receiverName: student?.fullName || "Teammate",
        projectTitle,
        requestType: "team_invitation",
        pitchMessage: `You have been selected by SwapEngine AI for the optimal dream squad on ${projectTitle}!`,
        synergyScore: 94,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    });

    setRequests((prev) => [...newBatch, ...prev]);
  };

  // Request status updates
  const handleAcceptRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
    );
  };

  const handleDeclineRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r))
    );
  };

  // Profile update — persists to localStorage automatically via useEffect
  const handleUpdateProfile = (updated: StudentProfile) => {
    setCurrentUser(updated);
    // Also update the student in the students list so their card reflects changes
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  // Filtered Students list with live AI synergy ranking
  const allDisplayStudents = [currentUser, ...students.filter((s) => s.id !== currentUser.id)];

  const filteredStudents = allDisplayStudents
    .filter((student) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        student.fullName.toLowerCase().includes(query) ||
        student.university.toLowerCase().includes(query) ||
        student.headline.toLowerCase().includes(query) ||
        student.skillsOffered.some((s) => s.name.toLowerCase().includes(query)) ||
        student.skillsSeeking.some((s) => s.name.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === "all" ||
        student.skillsOffered.some((s) => s.category === selectedCategory);

      const matchesUni =
        selectedUniversity === "all" ||
        student.university.toLowerCase().includes(selectedUniversity.toLowerCase());

      const synergy = calculateStudentSynergy(currentUser, student);
      const matchesSynergy =
        student.id === currentUser.id || synergy.overallScore >= minSynergyFilter;

      return matchesSearch && matchesCategory && matchesUni && matchesSynergy;
    })
    .sort((a, b) => {
      if (a.id === currentUser.id) return -1;
      if (b.id === currentUser.id) return 1;
      const synergyA = calculateStudentSynergy(currentUser, a).overallScore;
      const synergyB = calculateStudentSynergy(currentUser, b).overallScore;
      return synergyB - synergyA;
    });

  // Filtered Projects
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.tags.some((t) => t.toLowerCase().includes(query)) ||
      project.openRoles.some((r) =>
        r.requiredSkills.some((sk) => sk.toLowerCase().includes(query))
      );
    return matchesSearch;
  });

  const pendingRequestsCount = requests.filter(
    (r) => r.status === "pending" && r.receiverId === currentUser.id
  ).length;

  // Show loading skeleton while hydrating from storage
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 animate-pulse" />
          <p className="text-slate-400 text-sm">Loading SkillSwap AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col bg-grid-pattern relative">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-96 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        availablePersonas={availablePersonas}
        onSwitchPersona={handleSwitchPersona}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 pt-8 pb-16">

        {/* TAB 0: DASHBOARD */}
        {activeTab === "dashboard" && (
          <Dashboard
            currentUser={currentUser}
            students={students}
            projects={projects}
            requests={requests}
            onNavigate={setActiveTab}
            onOpenStudentDetail={handleOpenStudentDetail}
            onOpenProjectDetail={handleOpenProjectDetail}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
          />
        )}

        {/* Search & Filter Toolbar (for Students and Projects tabs) */}
        {(activeTab === "students" || activeTab === "projects") && (
          <div className="mb-8 p-4 rounded-2xl bg-navy-900/70 border border-slate-800 backdrop-blur-md shadow-lg space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={
                    activeTab === "students"
                      ? "Search by student name, skill (e.g. PyTorch, Next.js), university..."
                      : "Search by project title, keyword, required skill..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-xs sm:text-sm bg-navy-950/80"
                />
              </div>

              {/* Category filter */}
              {activeTab === "students" && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 rounded-lg border border-slate-700 bg-navy-950 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
                  >
                    <option value="all">All Disciplines</option>
                    <option value="frontend">Frontend Engineering</option>
                    <option value="backend">Distributed Backend</option>
                    <option value="ai_ml">AI &amp; Machine Learning</option>
                    <option value="design">UI/UX Design Systems</option>
                    <option value="cloud_devops">DevOps &amp; Cloud</option>
                    <option value="mobile">Mobile Applications</option>
                  </select>

                  {/* University Filter */}
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="h-10 rounded-lg border border-slate-700 bg-navy-950 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
                  >
                    <option value="all">All Campuses</option>
                    <option value="Stanford">Stanford</option>
                    <option value="Berkeley">UC Berkeley</option>
                    <option value="MIT">MIT</option>
                    <option value="Carnegie">Carnegie Mellon</option>
                    <option value="Waterloo">Waterloo</option>
                    <option value="Georgia Tech">Georgia Tech</option>
                  </select>
                </div>
              )}
            </div>

            {/* Match Threshold Slider (For Students tab) */}
            {activeTab === "students" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-300">
                    Min AI Match Threshold:
                  </span>
                  <span className="font-bold text-cyan-300">
                    {minSynergyFilter}%+
                  </span>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-64">
                  <input
                    type="range"
                    min={50}
                    max={90}
                    step={5}
                    value={minSynergyFilter}
                    onChange={(e) => setMinSynergyFilter(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {filteredStudents.length} matches
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DISCOVER TEAMMATES */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Complementary Teammates Feed
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked in real-time by compatibility score with your active profile ({currentUser.fullName}).
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-400 bg-navy-900 border border-slate-800 px-3 py-1 rounded-full">
                Showing {filteredStudents.length} Students
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  currentUser={currentUser}
                  onSelectStudent={handleOpenStudentDetail}
                  onRequestSwap={handleOpenSwapFromCard}
                />
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-navy-900/40 text-slate-400">
                <p className="text-base font-semibold text-slate-300 mb-1">
                  No teammates match the selected criteria
                </p>
                <p className="text-xs">
                  Try lowering the minimum match threshold or clearing the search keyword.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPLORE PROJECTS */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-cyan-400" />
                  Active Student Projects Recruiting Teammates
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Join an ambitious hackathon, startup MVP, or open source initiative needing your exact skills.
                </p>
              </div>

              <Button
                variant="glow"
                size="sm"
                onClick={() => setIsCreateProjectModalOpen(true)}
              >
                <Rocket className="w-4 h-4 mr-1.5" />
                Post New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUser={currentUser}
                  onSelectProject={handleOpenProjectDetail}
                  onApplyRole={handleApplyToProjectRole}
                  onOpenGapAnalyzer={handleOpenGapAnalyzer}
                />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-slate-800 bg-navy-900/40 text-slate-400">
                <p className="text-base font-semibold text-slate-300 mb-1">
                  No projects match your search
                </p>
                <p className="text-xs mb-4">
                  Clear the search query or post your own project.
                </p>
                <Button variant="glow" size="sm" onClick={() => setIsCreateProjectModalOpen(true)}>
                  <Rocket className="w-4 h-4 mr-1.5" />
                  Post a Project
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI DREAM TEAM BUILDER STUDIO */}
        {activeTab === "ai-studio" && (
          <TeamBuilderStudio
            students={students}
            projects={projects}
            currentUser={currentUser}
            onSendBatchInvites={handleBatchInvitesFromDreamTeam}
          />
        )}

        {/* TAB 4: COLLABORATION HUB & WORKSPACE */}
        {activeTab === "collab" && (
          <CollabHub
            requests={requests}
            currentUser={currentUser}
            projects={projects}
            onAcceptRequest={handleAcceptRequest}
            onDeclineRequest={handleDeclineRequest}
          />
        )}

        {/* TAB 5: MY SKILL PROFILE & MATCH RADAR */}
        {activeTab === "profile" && (
          <SkillProfileEditor
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Global Modals */}
      <StudentDetailModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={selectedStudentForModal}
        synergy={selectedStudentSynergy}
        currentUser={currentUser}
        onSubmitRequest={handleSendSwapProposal}
      />

      <ProjectDetailModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProjectForModal}
        currentUser={currentUser}
        preselectedRoleId={preselectedRoleId}
        onApply={handleApplySubmission}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        currentUser={currentUser}
        onCreateProject={handleCreateProject}
      />

      <TeamGapAnalyzerModal
        isOpen={isGapAnalyzerModalOpen}
        onClose={() => setIsGapAnalyzerModalOpen(false)}
        project={gapAnalyzerProject}
        allStudents={students}
        onInviteCandidate={handleInviteFromGapAnalyzer}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
