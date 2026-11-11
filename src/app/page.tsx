"use client";

import React, { useState, useEffect } from "react";
import {
  StudentProfile,
  Project,
  CollaborationRequest,
  SynergyBreakdown,
  ExchangeSession,
  ChatMessage,
  NotificationItem,
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
  loadStoredSessions,
  saveStoredSessions,
  loadStoredMessages,
  saveStoredMessages,
  loadStoredNotifications,
  saveStoredNotifications,
} from "@/lib/storage";
import { calculateStudentSynergy } from "@/lib/ai-matchmaker";
import { filterPublicProfiles } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  fetchPublicStudents,
  fetchProjects,
  fetchCollaborationRequests,
  fetchSessions,
  fetchMessages,
  fetchNotifications,
  updateStudentProfile as updateStudentProfileInDb,
  createProjectInDb,
  updateProjectInDb,
  deleteProjectFromDb,
  sendCollaborationRequest as sendCollaborationRequestInDb,
  updateRequestStatusInDb,
  updateCollaborationRequestStatus,
  scheduleSessionInDb,
  updateSessionStatusInDb,
  sendMessageInDb,
  markMessagesAsReadInDb,
  markNotificationAsReadInDb,
  markAllNotificationsAsReadInDb,
  createNotificationInDb,
  assignAdminRole,
  revokeAdminRole,
  checkUserAdminRole,
} from "@/lib/supabase/data-service";
import { Navbar } from "@/components/layout/Navbar";
import { HomeSection } from "@/components/home/HomeSection";
import { Footer } from "@/components/layout/Footer";
import { MarketplaceSection } from "@/components/marketplace/MarketplaceSection";
import { StudentDetailModal } from "@/components/students/StudentDetailModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectDetailModal } from "@/components/projects/ProjectDetailModal";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { TeamGapAnalyzerModal } from "@/components/ai/TeamGapAnalyzerModal";
import { TeamBuilderStudio } from "@/components/ai/TeamBuilderStudio";
import { CollabHub } from "@/components/workspace/CollabHub";
import { SkillProfileEditor } from "@/components/profile/SkillProfileEditor";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/lib/supabase/AuthContext";
import { SessionsManager } from "@/components/sessions/SessionsManager";
import { SessionSchedulerModal } from "@/components/sessions/SessionSchedulerModal";
import { DirectMessagingHub } from "@/components/messaging/DirectMessagingHub";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Search,
  Rocket,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function HomePage() {
  const {
    currentUser: authUser,
    isAuthenticated,
    logout: authLogout,
  } = useAuth();

  // Hydration guard: use null until client-side storage is loaded
  const [hydrated, setHydrated] = useState(false);

  // Active Persona State — initialized with authUser if present, otherwise default
  const [currentUser, setCurrentUser] = useState<StudentProfile>(MOCK_CURRENT_USER);
  const [activeTab, setActiveTab] = useState<string>("home");

  // Keep currentUser synced with authUser when user signs in or out
  useEffect(() => {
    if (authUser) {
      setCurrentUser(authUser);
    } else {
      setCurrentUser(MOCK_CURRENT_USER);
    }
  }, [authUser]);

  // Data Collections — initialized empty in Supabase mode to prevent mock data flash
  const [students, setStudents] = useState<StudentProfile[]>(isSupabaseConfigured ? [] : MOCK_STUDENTS);
  const [projects, setProjects] = useState<Project[]>(isSupabaseConfigured ? [] : MOCK_PROJECTS);
  const [requests, setRequests] = useState<CollaborationRequest[]>(isSupabaseConfigured ? [] : MOCK_REQUESTS);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(isSupabaseConfigured);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ExchangeSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Session scheduler modal state
  const [sessionSchedulerPartner, setSessionSchedulerPartner] = useState<StudentProfile | null>(null);
  const [isSessionSchedulerOpen, setIsSessionSchedulerOpen] = useState(false);

  // Hydrate data from Supabase if configured, otherwise fallback to local storage
  useEffect(() => {
    async function loadInitialData() {
      if (isSupabaseConfigured) {
        setIsLoadingInitialData(true);
        setDataLoadError(null);
        try {
          const [dbStudents, dbProjects] = await Promise.all([
            fetchPublicStudents(authUser?.id),
            fetchProjects(),
          ]);

          // Use real database collections (do not introduce mock data into live flow)
          setStudents(dbStudents || []);
          setProjects(dbProjects || []);

          if (authUser?.id) {
            const [dbReqs, dbSessions, dbMsgs, dbNotifs] = await Promise.all([
              fetchCollaborationRequests(authUser.id),
              fetchSessions(authUser.id),
              fetchMessages(authUser.id),
              fetchNotifications(authUser.id),
            ]);

            setRequests(dbReqs || []);
            setSessions(dbSessions || []);
            setMessages(dbMsgs || []);
            setNotifications(dbNotifs || []);
          } else {
            setRequests([]);
            setSessions([]);
            setMessages([]);
            setNotifications([]);
          }
        } catch (err: any) {
          console.warn("[InitialData] Error loading Supabase data:", err);
          setDataLoadError("Unable to retrieve real-time data from Supabase. Please verify network connectivity.");
          setStudents([]);
          setProjects([]);
        } finally {
          setIsLoadingInitialData(false);
        }
      } else {
        const storedUser = loadStoredCurrentUser();
        const storedStudents = loadStoredStudents();
        const storedProjects = loadStoredProjects();
        const storedRequests = loadStoredRequests();
        const storedSessions = loadStoredSessions();
        const storedMessages = loadStoredMessages();
        const storedNotifications = loadStoredNotifications();

        setCurrentUser(storedUser);
        setStudents(storedStudents);
        setProjects(storedProjects);
        setRequests(storedRequests);
        setSessions(storedSessions);
        setMessages(storedMessages);
        setNotifications(storedNotifications);
      }

      setHydrated(true);
    }

    loadInitialData();
  }, [authUser]);

  // Realtime notification sync for authenticated user
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !authUser?.id) return;

    const client = supabase;
    const channel = client
      .channel(`user-notifications-${authUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${authUser.id}`,
        },
        (payload) => {
          const newRow = payload.new as any;
          if (newRow) {
            setNotifications((prev) => [
              {
                id: newRow.id,
                userId: newRow.user_id,
                type: newRow.type,
                title: newRow.title,
                message: newRow.message,
                linkTab: newRow.link_tab || undefined,
                read: Boolean(newRow.read),
                createdAt: newRow.created_at,
              },
              ...prev.filter((n) => n.id !== newRow.id),
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [authUser?.id]);

  // Realtime message sync for authenticated user
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !authUser?.id) return;

    const client = supabase;
    const channel = client
      .channel(`user-messages-${authUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newRow = payload.new as any;
          if (
            newRow &&
            (newRow.receiver_id === authUser.id || newRow.sender_id === authUser.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newRow.id)) return prev;
              const sender = students.find((s) => s.id === newRow.sender_id);
              const newMsg: ChatMessage = {
                id: newRow.id,
                senderId: newRow.sender_id,
                senderName:
                  sender?.fullName ||
                  (newRow.sender_id === authUser.id ? currentUser.fullName : "Collaborator"),
                senderAvatar:
                  sender?.avatarUrl ||
                  (newRow.sender_id === authUser.id
                    ? currentUser.avatarUrl
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"),
                receiverId: newRow.receiver_id,
                content: newRow.content,
                timestamp: new Date(newRow.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                read: Boolean(newRow.read),
              };
              return [...prev, newMsg];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedRow = payload.new as any;
          if (
            updatedRow &&
            (updatedRow.receiver_id === authUser.id || updatedRow.sender_id === authUser.id)
          ) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updatedRow.id
                  ? { ...m, read: Boolean(updatedRow.read) }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [authUser?.id, currentUser.fullName, currentUser.avatarUrl, students]);

  // Persist changes to localStorage whenever state updates (after hydration)
  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredCurrentUser(currentUser);
  }, [currentUser, hydrated]);

  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredStudents(students);
  }, [students, hydrated]);

  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredProjects(projects);
  }, [projects, hydrated]);

  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredRequests(requests);
  }, [requests, hydrated]);

  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredSessions(sessions);
  }, [sessions, hydrated]);

  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    if (!hydrated || isSupabaseConfigured) return;
    saveStoredNotifications(notifications);
  }, [notifications, hydrated]);

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

  // ==========================================
  // AUTH HANDLERS
  // ==========================================
  const handleLogout = async () => {
    await authLogout();
    setCurrentUser(MOCK_CURRENT_USER);
  };

  // ==========================================
  // NOTIFICATION HELPERS
  // ==========================================
  const addNotification = (
    type: NotificationItem["type"],
    title: string,
    message: string,
    linkTab?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: currentUser.id,
      type,
      title,
      message,
      linkTab,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    if (isSupabaseConfigured && currentUser.id) {
      createNotificationInDb({
        userId: currentUser.id,
        type,
        title,
        message,
        linkTab,
      }).catch((e) => console.warn("[Notifications] Create in DB note:", e));
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    if (isSupabaseConfigured) {
      await markNotificationAsReadInDb(notificationId);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isSupabaseConfigured && currentUser.id) {
      await markAllNotificationsAsReadInDb(currentUser.id);
    }
  };

  // ==========================================
  // STUDENT MODAL HANDLERS
  // ==========================================
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

  const handleSendSwapProposal = async (receiverId: string, pitchMessage: string) => {
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

    if (isSupabaseConfigured) {
      const res = await sendCollaborationRequestInDb(newReq);
      if (res.success && res.data) {
        setRequests((prev) => prev.map((r) => (r.id === newReq.id ? res.data! : r)));
      }
    } else {
      addNotification(
        "request_received",
        "Swap Request Sent",
        `Your skill swap proposal was sent to ${receiver.fullName}.`,
        "collab"
      );
    }
  };

  // ==========================================
  // PROJECT MODAL HANDLERS
  // ==========================================
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

  const handleApplySubmission = async (projectId: string, roleTitle: string, pitch: string) => {
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

    if (isSupabaseConfigured) {
      const res = await sendCollaborationRequestInDb(newReq);
      if (res.success && res.data) {
        setRequests((prev) => prev.map((r) => (r.id === newReq.id ? res.data! : r)));
      }
    }
  };

  const handleCreateProject = async (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    if (isSupabaseConfigured && currentUser.id) {
      const res = await createProjectInDb(newProject, currentUser.id);
      if (res.success && res.data) {
        setProjects((prev) => prev.map((p) => (p.id === newProject.id ? res.data! : p)));
      }
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
    if (selectedProjectForModal?.id === projectId) {
      setSelectedProjectForModal((prev) => (prev ? { ...prev, ...updates } : prev));
    }
    if (isSupabaseConfigured && currentUser.id) {
      await updateProjectInDb(projectId, currentUser.id, updates);
    }
  };

  const handleOpenGapAnalyzer = (project: Project) => {
    setGapAnalyzerProject(project);
    setIsGapAnalyzerModalOpen(true);
  };

  const handleInviteFromGapAnalyzer = async (studentId: string, roleTitle: string, projectId: string) => {
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

    if (isSupabaseConfigured) {
      const res = await sendCollaborationRequestInDb(newReq);
      if (res.success && res.data) {
        setRequests((prev) => prev.map((r) => (r.id === newReq.id ? res.data! : r)));
      }
    }
  };

  const handleBatchInvitesFromDreamTeam = async (studentIds: string[], projectTitle: string) => {
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

    if (isSupabaseConfigured) {
      for (const req of newBatch) {
        const res = await sendCollaborationRequestInDb(req);
        if (res.success && res.data) {
          setRequests((prev) => prev.map((r) => (r.id === req.id ? res.data! : r)));
        }
      }
    }
  };

  // ==========================================
  // REQUEST STATUS UPDATES
  // ==========================================
  const handleAcceptRequest = async (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" } : r))
    );
    if (isSupabaseConfigured && currentUser.id) {
      await updateCollaborationRequestStatus(requestId, currentUser.id, "accepted");
    }
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      addNotification(
        "request_accepted",
        "Request Accepted",
        `You accepted a collaboration request from ${req.senderName}.`,
        "collab"
      );
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "declined" } : r))
    );
    if (isSupabaseConfigured && currentUser.id) {
      await updateCollaborationRequestStatus(requestId, currentUser.id, "declined");
    }
  };

  const handleCancelPendingRequest = async (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" } : r))
    );
    if (isSupabaseConfigured && currentUser.id) {
      await updateCollaborationRequestStatus(requestId, currentUser.id, "cancelled");
    }
  };

  const handleCancelAcceptedCollaboration = async (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" } : r))
    );
    if (isSupabaseConfigured && currentUser.id) {
      await updateCollaborationRequestStatus(requestId, currentUser.id, "cancelled");
    }
  };

  // ==========================================
  // PROFILE UPDATE
  // ==========================================
  const handleUpdateProfile = async (updated: StudentProfile) => {
    setCurrentUser(updated);
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    if (isSupabaseConfigured) {
      await updateStudentProfileInDb(updated);
    }
  };

  // ==========================================
  // SESSION HANDLERS
  // ==========================================
  const handleScheduleSession = async (newSession: ExchangeSession) => {
    setSessions((prev) => [newSession, ...prev]);
    if (isSupabaseConfigured && currentUser.id) {
      const res = await scheduleSessionInDb(newSession, currentUser.id);
      if (res.success && res.data) {
        setSessions((prev) => prev.map((s) => (s.id === newSession.id ? res.data! : s)));
      }
    }
    addNotification(
      "session_scheduled",
      "Session Scheduled",
      `1-on-1 session with ${newSession.partnerName} scheduled for ${new Date(newSession.scheduledAt).toLocaleDateString()}.`,
      "sessions"
    );
  };

  const handleUpdateSessionStatus = async (sessionId: string, newStatus: ExchangeSession["status"]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
    );
    if (isSupabaseConfigured && currentUser.id) {
      await updateSessionStatusInDb(sessionId, newStatus, currentUser.id);
    }
  };

  const handleOpenSessionScheduler = (partner: StudentProfile) => {
    setSessionSchedulerPartner(partner);
    setIsSessionSchedulerOpen(true);
  };

  // ==========================================
  // MESSAGE HANDLERS
  // ==========================================
  const handleSendMessage = async (receiverId: string, content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderAvatar: currentUser.avatarUrl,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, newMsg]);

    if (isSupabaseConfigured) {
      await sendMessageInDb(newMsg);
    }
  };

  const handleMarkMessagesAsRead = async (partnerId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.senderId === partnerId && m.receiverId === currentUser.id
          ? { ...m, read: true }
          : m
      )
    );
    if (isSupabaseConfigured && currentUser.id) {
      await markMessagesAsReadInDb(currentUser.id, partnerId);
    }
  };

  // ==========================================
  // ADMIN HANDLERS
  // ==========================================
  const handleUpdateUserRole = async (userId: string, newRole: StudentProfile["role"]) => {
    if (isSupabaseConfigured && currentUser.id) {
      if (newRole === "admin") {
        const res = await assignAdminRole(currentUser.id, userId, "admin");
        if (!res.success) {
          throw new Error(res.error || "Failed to grant admin role.");
        }
      } else {
        const res = await revokeAdminRole(currentUser.id, userId);
        if (!res.success) {
          throw new Error(res.error || "Failed to revoke admin role.");
        }
      }
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, role: newRole } : s))
    );
    if (userId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (isSupabaseConfigured) {
      await deleteProjectFromDb(projectId);
    }
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  // Filtered Students list with live AI synergy ranking
  const visibleStudents = filterPublicProfiles(students, currentUser.id);
  const allDisplayStudents =
    authUser || !isSupabaseConfigured
      ? [currentUser, ...visibleStudents.filter((s) => s.id !== currentUser.id)]
      : visibleStudents;

  const filteredStudents = allDisplayStudents
    .filter((student) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        student.fullName.toLowerCase().includes(query) ||
        student.university.toLowerCase().includes(query) ||
        student.headline.toLowerCase().includes(query) ||
        student.bio.toLowerCase().includes(query) ||
        student.skillsOffered.some(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.category.toLowerCase().includes(query)
        ) ||
        student.skillsSeeking.some(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.category.toLowerCase().includes(query)
        );

      const matchesCategory =
        selectedCategory === "all" ||
        student.skillsOffered.some((s) => s.category === selectedCategory) ||
        student.skillsSeeking.some((s) => s.category === selectedCategory);

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

  const unreadMessageCount = messages.filter(
    (m) => m.receiverId === currentUser.id && !m.read
  ).length;

  // Show loading skeleton while hydrating from storage
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-pink-500 animate-pulse shadow-lg shadow-purple-600/30" />
          <p className="text-gray-400 text-sm font-medium">Loading SkillSwap AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col bg-grid-pattern relative overflow-x-hidden w-full max-w-full">
      {/* Ambient background glows - contained strictly within viewport */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[350px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[120px] sm:blur-[160px]" />
        <div className="absolute top-96 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-violet-600/10 rounded-full blur-[120px] sm:blur-[160px]" />
      </div>

      {/* Global Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        availablePersonas={availablePersonas}
        onSwitchPersona={handleSwitchPersona}
        pendingRequestsCount={pendingRequestsCount}
        isAuthenticated={isAuthenticated}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full">
        {/* Global Connection / Data Error Banner */}
        {dataLoadError && (
          <div className="custom-screen pt-4">
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{dataLoadError}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-rose-500/40 hover:bg-rose-500/20 shrink-0"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* TAB 0: HOME */}
        {activeTab === "home" && (
          <HomeSection
            students={students}
            currentUser={currentUser}
            onOpenSession={setSessionSchedulerPartner}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* APPLICATION VIEWS (Dashboard, Marketplace, Projects, Studio, Hubs) */}
        {activeTab !== "home" && (
          <div className="custom-screen py-8">
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
          <div className="mb-8 p-4 rounded-2xl bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={
                    activeTab === "students"
                      ? "Search by student name, skill (e.g. PyTorch, Next.js), university..."
                      : "Search by project title, keyword, required skill..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-xs sm:text-sm bg-gray-950/80 border-gray-800 text-gray-200 placeholder-gray-500 focus:border-purple-500 rounded-xl"
                />
              </div>

              {/* Category filter */}
              {activeTab === "students" && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 rounded-xl border border-gray-800 bg-gray-950 px-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 w-full md:w-auto"
                  >
                    <option value="all">All Disciplines</option>
                    <option value="frontend">Frontend Engineering</option>
                    <option value="backend">Distributed Backend</option>
                    <option value="ai_ml">AI &amp; Machine Learning</option>
                    <option value="design">UI/UX Design Systems</option>
                    <option value="cloud_devops">DevOps &amp; Cloud</option>
                    <option value="mobile">Mobile Applications</option>
                    <option value="hardware_iot">Hardware &amp; IoT</option>
                    <option value="product_management">Product Management</option>
                    <option value="data_science">Data Science</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="languages">Languages</option>
                    <option value="other">Other Disciplines</option>
                  </select>

                  {/* University Filter */}
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="h-10 rounded-xl border border-gray-800 bg-gray-950 px-3 text-xs text-gray-200 focus:outline-none focus:border-purple-500 w-full md:w-auto"
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-gray-300">
                    Min AI Match Threshold:
                  </span>
                  <span className="font-bold text-purple-400">
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
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {filteredStudents.length} matches
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: DISCOVER TEAMMATES */}
        {activeTab === "students" && (
          isLoadingInitialData ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-sm font-medium text-gray-300">Loading discoverable profiles from Supabase...</p>
            </div>
          ) : (
            <MarketplaceSection
            students={filteredStudents}
            currentUser={currentUser}
            onOpenStudentDetail={handleOpenStudentDetail}
            onRequestSwap={handleOpenSwapFromCard}
            onNavigateToProfile={() => setActiveTab("profile")}
          />)
        )}

        {/* TAB 2: EXPLORE PROJECTS */}
        {activeTab === "projects" && (
          isLoadingInitialData ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-sm font-medium text-gray-300">Loading active projects from Supabase...</p>
            </div>
          ) : (
            <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-400" />
                  Active Student Projects Recruiting Teammates
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Join an ambitious hackathon, startup MVP, or open source initiative needing your exact skills.
                </p>
              </div>

              <Button
                variant="purple"
                size="sm"
                className="rounded-full shadow-lg shadow-purple-600/30"
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
              <div className="p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/40 text-gray-400">
                <p className="text-base font-semibold text-gray-300 mb-1">
                  No projects match your search
                </p>
                <p className="text-xs mb-4">
                  Clear the search query or post your own project.
                </p>
                <Button variant="purple" size="sm" className="rounded-full" onClick={() => setIsCreateProjectModalOpen(true)}>
                  <Rocket className="w-4 h-4 mr-1.5" />
                  Post a Project
                </Button>
              </div>
            )}
          </div>
          )
        )}

        {/* TAB 3: AI DREAM TEAM BUILDER STUDIO */}
        {activeTab === "ai-studio" && (
          <TeamBuilderStudio
            students={students}
            projects={projects}
            currentUser={currentUser}
            onSendBatchInvites={handleBatchInvitesFromDreamTeam}
            onNavigateToProjects={() => setActiveTab("projects")}
            onCreateProject={() => setIsCreateProjectModalOpen(true)}
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
            onCancelPendingRequest={handleCancelPendingRequest}
            onCancelAcceptedCollaboration={handleCancelAcceptedCollaboration}
          />
        )}

        {/* TAB 5: 1-ON-1 SESSIONS */}
        {activeTab === "sessions" && (
          <SessionsManager
            sessions={sessions}
            currentUser={currentUser}
            onUpdateSessionStatus={handleUpdateSessionStatus}
            onNavigate={setActiveTab}
          />
        )}

        {/* TAB 6: DIRECT MESSAGES */}
        {activeTab === "messages" && (
          <DirectMessagingHub
            currentUser={currentUser}
            students={students}
            messages={messages}
            onSendMessage={handleSendMessage}
            onOpenScheduleModal={handleOpenSessionScheduler}
            onNavigate={setActiveTab}
            onMarkMessagesAsRead={handleMarkMessagesAsRead}
          />
        )}

        {/* TAB 7: MY SKILL PROFILE & MATCH RADAR */}
        {activeTab === "profile" && (
          <SkillProfileEditor
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* TAB 8: ADMIN DASHBOARD (Verified Admin or Moderator only) */}
        {activeTab === "admin" && (currentUser.role === "admin" || currentUser.role === "moderator") && (
          <AdminDashboard
            currentUser={currentUser}
            students={students}
            projects={projects}
            requests={requests}
            sessions={sessions}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {/* Admin access denied for ordinary users */}
        {activeTab === "admin" && currentUser.role !== "admin" && currentUser.role !== "moderator" && (
          <div className="p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/60 text-gray-400">
            <p className="text-base font-semibold text-gray-300 mb-1">
              Admin Access Required
            </p>
            <p className="text-xs">
              You need verified administrator privileges in the database to access this dashboard.
            </p>
          </div>
        )}
          </div>
        )}
      </main>

      {/* ==========================================
          GLOBAL MODALS
          ========================================== */}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={selectedStudentForModal}
        synergy={selectedStudentSynergy}
        currentUser={currentUser}
        onSubmitRequest={handleSendSwapProposal}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={selectedProjectForModal}
        currentUser={currentUser}
        preselectedRoleId={preselectedRoleId}
        onApply={handleApplySubmission}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        currentUser={currentUser}
        onCreateProject={handleCreateProject}
      />

      {/* Team Gap Analyzer Modal */}
      <TeamGapAnalyzerModal
        isOpen={isGapAnalyzerModalOpen}
        onClose={() => setIsGapAnalyzerModalOpen(false)}
        project={gapAnalyzerProject}
        allStudents={students}
        onInviteCandidate={handleInviteFromGapAnalyzer}
      />

      {/* Session Scheduler Modal */}
      <SessionSchedulerModal
        isOpen={isSessionSchedulerOpen}
        onClose={() => setIsSessionSchedulerOpen(false)}
        currentUser={currentUser}
        partner={sessionSchedulerPartner}
        onScheduleSession={handleScheduleSession}
      />

      {/* Global Footer */}
      <Footer onNavigateTab={setActiveTab} />
    </div>
  );
}
