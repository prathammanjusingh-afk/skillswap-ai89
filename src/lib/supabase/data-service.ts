import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  StudentProfile,
  Project,
  CollaborationRequest,
  ExchangeSession,
  ChatMessage,
  NotificationItem,
  SkillItem,
} from "@/types";

export interface ReviewItem {
  id: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerAvatar?: string;
  targetId: string;
  sessionId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// PROFILES & MARKETPLACE SERVICES
// -----------------------------------------------------------------------------

export async function fetchPublicStudents(currentUserId?: string): Promise<StudentProfile[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    // RLS and view enforce that only public profiles or own profile are returned
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !profiles) {
      console.warn("[DataService] Profiles query note:", error?.message);
      return [];
    }

    // Strict privacy visibility guarantee: only public profiles or viewing user's own profile
    const visibleProfiles = profiles.filter(
      (p: any) => p.is_public === true || (currentUserId && p.id === currentUserId)
    );

    // Fetch skills for these profiles
    const profileIds = visibleProfiles.map((p) => p.id);
    const { data: skillsData } = await supabase
      .from("profile_skills")
      .select("*")
      .in("profile_id", profileIds);

    // Fetch admin roles for these profiles
    const { data: adminRolesData } = await supabase
      .from("admin_roles")
      .select("user_id, role")
      .in("user_id", profileIds);

    const rolesByUser: Record<string, 'student' | 'admin' | 'moderator'> = {};
    adminRolesData?.forEach((r: any) => {
      rolesByUser[r.user_id] = r.role === 'admin' || r.role === 'super_admin' ? 'admin' : 'moderator';
    });

    const skillsByProfile: Record<string, { offered: SkillItem[]; seeking: SkillItem[]; all: string[] }> = {};
    skillsData?.forEach((sk: any) => {
      if (!skillsByProfile[sk.profile_id]) {
        skillsByProfile[sk.profile_id] = { offered: [], seeking: [], all: [] };
      }
      const item: SkillItem = {
        name: sk.skill_name,
        category: sk.category,
        proficiency: sk.proficiency || "intermediate",
        type: sk.skill_type,
      };
      if (sk.skill_type === "offered") {
        skillsByProfile[sk.profile_id].offered.push(item);
      } else {
        skillsByProfile[sk.profile_id].seeking.push(item);
      }
      if (!skillsByProfile[sk.profile_id].all.includes(sk.skill_name)) {
        skillsByProfile[sk.profile_id].all.push(sk.skill_name);
      }
    });

    return visibleProfiles.map((p: any) => ({
      id: p.id,
      email: currentUserId === p.id ? p.email : undefined, // Keep email private
      fullName: p.full_name || "Student Innovator",
      avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "User")}`,
      headline: p.headline || "Passionate Tech Student Looking for Collaborators",
      university: p.university || "Campus University",
      major: p.major || "Computer Science",
      graduationYear: p.graduation_year || 2026,
      bio: p.bio || "",
      availabilityHoursPerWeek: p.availability_hours_per_week || 15,
      preferredWorkStyle: p.preferred_work_style || "hybrid",
      timezone: p.timezone || "EST (UTC-5)",
      isPublic: Boolean(p.is_public),
      role: rolesByUser[p.id] || "student",
      completedProjectsCount: 0,
      badges: ["Verified Student"],
      skillsOffered: skillsByProfile[p.id]?.offered || [],
      skillsSeeking: skillsByProfile[p.id]?.seeking || [],
      skills: skillsByProfile[p.id]?.all || [],
      githubUrl: p.github_url || undefined,
      linkedinUrl: p.linkedin_url || undefined,
      portfolioUrl: p.portfolio_url || undefined,
    }));
  } catch (err) {
    console.warn("[DataService] Exception fetching public students:", err);
    return [];
  }
}

export async function updateProfilePrivacy(
  userId: string,
  isPublic: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { success: false, error: "Database not configured or missing userId." };
  }
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_public: isPublic } as any)
      .eq("id", userId);

    if (error) throw error;

    try {
      await supabase.auth.updateUser({
        data: { is_public: isPublic, isPublic },
      });
    } catch {
      // ignore auth metadata errors
    }

    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error updating privacy in database:", err);
    return { success: false, error: err.message };
  }
}

export async function updateStudentProfile(
  profile: StudentProfile
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: profile.fullName,
        headline: profile.headline,
        university: profile.university,
        major: profile.major,
        graduation_year: profile.graduationYear,
        bio: profile.bio,
        availability_hours_per_week: profile.availabilityHoursPerWeek,
        preferred_work_style: profile.preferredWorkStyle,
        timezone: profile.timezone,
        github_url: profile.githubUrl || null,
        linkedin_url: profile.linkedinUrl || null,
        portfolio_url: profile.portfolioUrl || null,
        is_public: profile.isPublic ?? false,
      })
      .eq("id", profile.id);

    if (profileError) throw profileError;

    // Synchronize skills: remove old and insert current
    await supabase.from("profile_skills").delete().eq("profile_id", profile.id);

    const skillsToInsert = [
      ...profile.skillsOffered.map((s) => ({
        profile_id: profile.id,
        skill_name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        skill_type: "offered",
      })),
      ...profile.skillsSeeking.map((s) => ({
        profile_id: profile.id,
        skill_name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        skill_type: "seeking",
      })),
    ];

    if (skillsToInsert.length > 0) {
      const { error: skillsError } = await supabase
        .from("profile_skills")
        .insert(skillsToInsert);
      if (skillsError) throw skillsError;
    }

    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error updating profile:", err);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// PROJECTS & ROLES SERVICES
// -----------------------------------------------------------------------------

export async function fetchProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data: projectsData, error } = await supabase
      .from("projects")
      .select(`
        *,
        profiles:creator_id (
          full_name,
          avatar_url,
          university
        ),
        project_roles (*)
      `)
      .order("created_at", { ascending: false });

    if (error || !projectsData) {
      console.error("[DataService] Error fetching projects:", error);
      return [];
    }

    return projectsData.map((p: any) => ({
      id: p.id,
      creatorId: p.creator_id,
      creatorName: p.profiles?.full_name || "Project Lead",
      creatorAvatar: p.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      creatorUniversity: p.profiles?.university || "Campus University",
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      category: p.category,
      projectType: p.project_type,
      stage: p.stage,
      targetEvent: p.target_event || undefined,
      weeklyHoursRequired: p.weekly_hours_required || 12,
      tags: p.tags || [],
      repoUrl: p.repo_url || undefined,
      demoUrl: p.demo_url || undefined,
      status: p.status || "recruiting",
      currentTeamSize: 1,
      maxTeamSize: (p.project_roles?.length || 0) + 1,
      createdAt: p.created_at,
      openRoles: (p.project_roles || []).map((r: any) => ({
        id: r.id,
        title: r.role_title,
        description: r.description || "",
        requiredSkills: r.required_skills || [],
        isFilled: r.is_filled ?? false,
        filledByProfileId: r.filled_by_profile_id || undefined,
      })),
    }));
  } catch (err) {
    console.error("[DataService] Exception fetching projects:", err);
    return [];
  }
}

export async function createProjectInDb(
  project: Omit<Project, "id" | "createdAt">,
  creatorId: string
): Promise<{ success: boolean; data?: Project; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { data: newProj, error } = await supabase
      .from("projects")
      .insert({
        creator_id: creatorId,
        title: project.title,
        tagline: project.tagline,
        description: project.description,
        category: project.category,
        project_type: project.projectType,
        stage: project.stage,
        target_event: project.targetEvent || null,
        weekly_hours_required: project.weeklyHoursRequired,
        tags: project.tags,
        repo_url: project.repoUrl || null,
        demo_url: project.demoUrl || null,
        status: project.status || "recruiting",
      })
      .select()
      .single();

    if (error || !newProj) throw error;

    // Add roles
    if (project.openRoles && project.openRoles.length > 0) {
      const rolesToInsert = project.openRoles.map((r) => ({
        project_id: newProj.id,
        role_title: r.title,
        description: r.description,
        required_skills: r.requiredSkills,
        is_filled: false,
      }));

      await supabase.from("project_roles").insert(rolesToInsert);
    }

    return {
      success: true,
      data: {
        ...project,
        id: newProj.id,
        createdAt: newProj.created_at,
      },
    };
  } catch (err: any) {
    console.error("[DataService] Error creating project:", err);
    return { success: false, error: err.message };
  }
}

export async function updateProjectInDb(
  projectId: string,
  creatorId: string,
  updates: Partial<Project>
): Promise<{ success: boolean; data?: Partial<Project>; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.tagline !== undefined) payload.tagline = updates.tagline;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.projectType !== undefined) payload.project_type = updates.projectType;
    if (updates.stage !== undefined) payload.stage = updates.stage;
    if (updates.targetEvent !== undefined) payload.target_event = updates.targetEvent || null;
    if (updates.weeklyHoursRequired !== undefined) payload.weekly_hours_required = updates.weeklyHoursRequired;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.repoUrl !== undefined) payload.repo_url = updates.repoUrl || null;
    if (updates.demoUrl !== undefined) payload.demo_url = updates.demoUrl || null;
    if (updates.status !== undefined) payload.status = updates.status;

    // Enforce creator permissions: creator_id must equal creatorId
    const { error: projectError } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", projectId)
      .eq("creator_id", creatorId);

    if (projectError) throw projectError;

    // If openRoles are provided, synchronize them
    if (updates.openRoles) {
      await supabase.from("project_roles").delete().eq("project_id", projectId);

      if (updates.openRoles.length > 0) {
        const rolesToInsert = updates.openRoles.map((r) => ({
          project_id: projectId,
          role_title: r.title,
          description: r.description,
          required_skills: r.requiredSkills,
          is_filled: r.isFilled ?? false,
          filled_by_profile_id: r.filledByProfileId || null,
        }));
        await supabase.from("project_roles").insert(rolesToInsert);
      }
    }

    return { success: true, data: updates };
  } catch (err: any) {
    console.error("[DataService] Error updating project:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteProjectFromDb(
  projectId: string,
  creatorId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    let query = supabase.from("projects").delete().eq("id", projectId);
    if (creatorId) {
      query = query.eq("creator_id", creatorId);
    }
    const { error } = await query;
    return !error;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// COLLABORATION REQUESTS SERVICES
// -----------------------------------------------------------------------------

export async function fetchCollaborationRequests(userId: string): Promise<CollaborationRequest[]> {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from("collaboration_requests")
      .select(`
        *,
        sender:sender_id (full_name, avatar_url, headline, university),
        receiver:receiver_id (full_name),
        projects:project_id (title)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("[DataService] Error fetching requests:", error);
      return [];
    }

    return data.map((r: any) => ({
      id: r.id,
      senderId: r.sender_id,
      senderName: r.sender?.full_name || "Applicant",
      senderAvatar: r.sender?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      senderHeadline: r.sender?.headline || "Student Member",
      senderUniversity: r.sender?.university || "Campus University",
      receiverId: r.receiver_id || undefined,
      receiverName: r.receiver?.full_name || undefined,
      projectId: r.project_id || undefined,
      projectTitle: r.projects?.title || undefined,
      requestType: r.request_type,
      pitchMessage: r.pitch_message,
      synergyScore: r.synergy_score || 85,
      status: r.status,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[DataService] Exception fetching requests:", err);
    return [];
  }
}

export async function sendCollaborationRequest(
  req: Omit<CollaborationRequest, "id" | "createdAt">
): Promise<{ success: boolean; data?: CollaborationRequest; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("collaboration_requests")
      .insert({
        sender_id: req.senderId,
        receiver_id: req.receiverId || null,
        project_id: req.projectId || null,
        request_type: req.requestType,
        pitch_message: req.pitchMessage,
        synergy_score: req.synergyScore,
        status: req.status || "pending",
      })
      .select()
      .single();

    if (error || !data) throw error;

    // Send notification to receiver if applicable
    if (req.receiverId) {
      await createNotificationInDb({
        userId: req.receiverId,
        type: "request_received",
        title: "New Collaboration Request",
        message: `${req.senderName} sent you a ${req.requestType.replace(/_/g, " ")}.`,
        linkTab: "collab",
      });
    }

    return {
      success: true,
      data: {
        ...req,
        id: data.id,
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    console.error("[DataService] Error sending collaboration request:", err);
    return { success: false, error: err.message };
  }
}

export async function updateCollaborationRequestStatus(
  requestId: string,
  userId: string,
  newStatus: CollaborationRequest["status"]
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    // 1. Fetch current request to validate permissions and state transition
    const { data: currentReq, error: fetchError } = await supabase
      .from("collaboration_requests")
      .select("*, projects:project_id (creator_id)")
      .eq("id", requestId)
      .maybeSingle();

    if (fetchError || !currentReq) {
      return { success: false, error: "Collaboration request not found." };
    }

    const isSender = currentReq.sender_id === userId;
    const isReceiver = currentReq.receiver_id === userId;
    const isProjectCreator = currentReq.projects?.creator_id === userId;
    const isRecipientAuthorized = isReceiver || isProjectCreator;
    const isParticipant = isSender || isReceiver || isProjectCreator;

    // 2. Validate state transitions & permissions
    if (newStatus === "accepted" || newStatus === "declined") {
      if (!isRecipientAuthorized) {
        return { success: false, error: "Unauthorized: Only the recipient or project lead can accept or decline this request." };
      }
      if (currentReq.status !== "pending") {
        return { success: false, error: `Cannot ${newStatus} a request that is already ${currentReq.status}.` };
      }
    } else if (newStatus === "cancelled") {
      if (currentReq.status === "pending" && !isSender) {
        return { success: false, error: "Unauthorized: Only the sender can cancel a pending proposal." };
      }
      if (currentReq.status === "accepted" && !isParticipant) {
        return { success: false, error: "Unauthorized: Only collaboration participants can cancel an accepted partnership." };
      }
      if (currentReq.status === "declined" || currentReq.status === "cancelled") {
        return { success: false, error: `Request is already ${currentReq.status}.` };
      }
    }

    // 3. Update status in database
    const { error: updateError } = await supabase
      .from("collaboration_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateError) throw updateError;

    // 4. Send notification to the other participant
    const notifyTargetId = isSender ? currentReq.receiver_id : currentReq.sender_id;
    if (notifyTargetId) {
      if (newStatus === "accepted") {
        await createNotificationInDb({
          userId: notifyTargetId,
          type: "request_accepted",
          title: "Collaboration Accepted!",
          message: `Your ${currentReq.request_type.replace(/_/g, " ")} was accepted. You can now coordinate in the Workspace.`,
          linkTab: "collab",
        });
      } else if (newStatus === "declined") {
        await createNotificationInDb({
          userId: notifyTargetId,
          type: "request_declined",
          title: "Collaboration Declined",
          message: `Your ${currentReq.request_type.replace(/_/g, " ")} was declined.`,
          linkTab: "collab",
        });
      } else if (newStatus === "cancelled") {
        await createNotificationInDb({
          userId: notifyTargetId,
          type: "request_declined",
          title: "Collaboration Cancelled",
          message: `The collaboration was cancelled by ${isSender ? "the sender" : "a partner"}.`,
          linkTab: "collab",
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error updating request status:", err);
    return { success: false, error: err.message };
  }
}

export async function updateRequestStatusInDb(
  requestId: string,
  newStatus: CollaborationRequest["status"],
  userId?: string
): Promise<boolean> {
  if (userId) {
    const res = await updateCollaborationRequestStatus(requestId, userId, newStatus);
    return res.success;
  }
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from("collaboration_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    return !error;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// SESSIONS SERVICES
// -----------------------------------------------------------------------------

export async function fetchSessions(userId: string): Promise<ExchangeSession[]> {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        creator:creator_id (full_name, avatar_url, university),
        partner:partner_id (full_name, avatar_url, university)
      `)
      .or(`creator_id.eq.${userId},partner_id.eq.${userId}`)
      .order("scheduled_at", { ascending: true });

    if (error || !data) return [];

    return data.map((s: any) => {
      const isCreator = s.creator_id === userId;
      const otherUser = isCreator ? s.partner : s.creator;
      return {
        id: s.id,
        partnerId: isCreator ? s.partner_id : s.creator_id,
        partnerName: otherUser?.full_name || "Peer Collaborator",
        partnerAvatar: otherUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        partnerUniversity: otherUser?.university || "Campus University",
        skillToLearn: s.skill_to_learn,
        skillToTeach: s.skill_to_teach,
        scheduledAt: s.scheduled_at,
        durationMinutes: s.duration_minutes,
        status: s.status,
        meetingType: s.meeting_type,
        meetingLink: s.meeting_link || undefined,
        notes: s.notes || undefined,
        createdAt: s.created_at,
      };
    });
  } catch (err) {
    console.error("[DataService] Error fetching sessions:", err);
    return [];
  }
}

export async function scheduleSessionInDb(
  session: Omit<ExchangeSession, "id" | "createdAt">,
  creatorId: string
): Promise<{ success: boolean; data?: ExchangeSession; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  // 1. Participant validation
  if (creatorId === session.partnerId) {
    return { success: false, error: "Cannot schedule a collaboration session with yourself." };
  }

  // 2. Booking time validation
  const sessionDate = new Date(session.scheduledAt);
  if (isNaN(sessionDate.getTime())) {
    return { success: false, error: "Invalid session scheduled time provided." };
  }
  if (sessionDate.getTime() < Date.now() - 120000) {
    return { success: false, error: "Session must be scheduled for a future date and time." };
  }

  // 3. Duration validation
  if (session.durationMinutes < 15 || session.durationMinutes > 240) {
    return { success: false, error: "Session duration must be between 15 and 240 minutes." };
  }

  try {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        creator_id: creatorId,
        partner_id: session.partnerId,
        skill_to_learn: session.skillToLearn,
        skill_to_teach: session.skillToTeach,
        scheduled_at: session.scheduledAt,
        duration_minutes: session.durationMinutes,
        status: session.status || "scheduled",
        meeting_type: session.meetingType,
        meeting_link: session.meetingLink || null,
        notes: session.notes || null,
      })
      .select()
      .single();

    if (error || !data) throw error;

    // Notify partner
    await createNotificationInDb({
      userId: session.partnerId,
      type: "session_scheduled",
      title: "1-on-1 Session Scheduled",
      message: `A peer learning session has been scheduled for ${sessionDate.toLocaleDateString()}.`,
      linkTab: "sessions",
    });

    return {
      success: true,
      data: {
        ...session,
        id: data.id,
        createdAt: data.created_at,
      },
    };
  } catch (err: any) {
    console.error("[DataService] Error scheduling session:", err);
    return { success: false, error: err.message };
  }
}

export async function updateSessionStatusInDb(
  sessionId: string,
  newStatus: ExchangeSession["status"],
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    // 1. Participant authorization check
    if (userId) {
      const { data: sessionRow, error: fetchErr } = await supabase
        .from("sessions")
        .select("creator_id, partner_id, status")
        .eq("id", sessionId)
        .maybeSingle();

      if (fetchErr || !sessionRow) {
        return { success: false, error: "Session not found." };
      }

      if (sessionRow.creator_id !== userId && sessionRow.partner_id !== userId) {
        return { success: false, error: "Unauthorized: Only session participants can update this session." };
      }

      const otherParticipantId = sessionRow.creator_id === userId ? sessionRow.partner_id : sessionRow.creator_id;
      if (newStatus === "completed") {
        await createNotificationInDb({
          userId: otherParticipantId,
          type: "session_scheduled",
          title: "Session Marked Completed",
          message: "Your peer has marked the exchange session as completed. You can now leave a review!",
          linkTab: "sessions",
        });
      } else if (newStatus === "cancelled") {
        await createNotificationInDb({
          userId: otherParticipantId,
          type: "session_scheduled",
          title: "Session Cancelled",
          message: "A scheduled peer learning session was cancelled.",
          linkTab: "sessions",
        });
      }
    }

    const { error } = await supabase
      .from("sessions")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error updating session:", err);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// MESSAGES SERVICES
// -----------------------------------------------------------------------------

export async function fetchMessages(userId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id (full_name, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((m: any) => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender?.full_name || "Collaborator",
      senderAvatar: m.sender?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      receiverId: m.receiver_id,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: Boolean(m.read),
    }));
  } catch (err) {
    console.error("[DataService] Error fetching messages:", err);
    return [];
  }
}

export async function markMessagesAsReadInDb(
  currentUserId: string,
  partnerId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !currentUserId || !partnerId) return false;
  try {
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("receiver_id", currentUserId)
      .eq("sender_id", partnerId)
      .eq("read", false);

    return !error;
  } catch {
    return false;
  }
}

export async function sendMessageInDb(
  message: Omit<ChatMessage, "id" | "timestamp" | "read">
): Promise<{ success: boolean; data?: ChatMessage; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        content: message.content,
        read: false,
      })
      .select()
      .single();

    if (error || !data) throw error;

    // Send unread message notification to receiver
    await createNotificationInDb({
      userId: message.receiverId,
      type: "new_message",
      title: `Message from ${message.senderName}`,
      message: message.content.length > 60 ? `${message.content.slice(0, 60)}...` : message.content,
      linkTab: "messages",
    });

    return {
      success: true,
      data: {
        ...message,
        id: data.id,
        timestamp: data.created_at,
        read: false,
      },
    };
  } catch (err: any) {
    console.error("[DataService] Error sending message:", err);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// NOTIFICATIONS SERVICES
// -----------------------------------------------------------------------------

export async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      linkTab: n.link_tab || undefined,
      read: n.read,
      createdAt: n.created_at,
    }));
  } catch (err) {
    console.error("[DataService] Error fetching notifications:", err);
    return [];
  }
}

export async function createNotificationInDb(
  notif: Omit<NotificationItem, "id" | "read" | "createdAt">
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: notif.userId,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link_tab: notif.linkTab || null,
      read: false,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function markNotificationAsReadInDb(notificationId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);
    return !error;
  } catch {
    return false;
  }
}

export async function markAllNotificationsAsReadInDb(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId);
    return !error;
  } catch {
    return false;
  }
}

// -----------------------------------------------------------------------------
// REVIEWS SERVICES
// -----------------------------------------------------------------------------

export async function fetchReviews(targetUserId: string): Promise<ReviewItem[]> {
  if (!isSupabaseConfigured || !supabase || !targetUserId) return [];

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:reviewer_id (full_name, avatar_url)
      `)
      .eq("target_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer?.full_name || "Student Peer",
      reviewerAvatar: r.reviewer?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      targetId: r.target_id,
      sessionId: r.session_id || undefined,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[DataService] Error fetching reviews:", err);
    return [];
  }
}

export async function checkReviewEligibility(
  reviewerId: string,
  targetId: string
): Promise<{ eligible: boolean; reason?: string }> {
  if (reviewerId === targetId) {
    return { eligible: false, reason: "You cannot write a review for your own profile." };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { eligible: true }; // allow in demo/preview mode
  }

  try {
    // 1. Check for completed exchange sessions between participants
    const { data: sessionMatch } = await supabase
      .from("sessions")
      .select("id")
      .or(`and(creator_id.eq.${reviewerId},partner_id.eq.${targetId}),and(creator_id.eq.${targetId},partner_id.eq.${reviewerId})`)
      .limit(1);

    if (sessionMatch && sessionMatch.length > 0) {
      return { eligible: true };
    }

    // 2. Check for accepted collaboration requests between participants
    const { data: collabMatch } = await supabase
      .from("collaboration_requests")
      .select("id")
      .eq("status", "accepted")
      .or(`and(sender_id.eq.${reviewerId},receiver_id.eq.${targetId}),and(sender_id.eq.${targetId},receiver_id.eq.${reviewerId})`)
      .limit(1);

    if (collabMatch && collabMatch.length > 0) {
      return { eligible: true };
    }

    return {
      eligible: false,
      reason: "To maintain authenticity, reviews are only available after scheduling a session or accepting a collaboration with this student.",
    };
  } catch (err) {
    console.warn("[DataService] checkReviewEligibility note:", err);
    return { eligible: true }; // Fallback gracefully if tables are in preview
  }
}

export async function submitReview(review: {
  reviewerId: string;
  targetId: string;
  sessionId?: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; error?: string }> {
  // 1. Prevent self-reviews
  if (review.reviewerId === review.targetId) {
    return { success: false, error: "You cannot leave a review for yourself." };
  }

  // 2. Rating bounds validation
  if (review.rating < 1 || review.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5 stars." };
  }

  // 3. Comment validation
  if (!review.comment.trim()) {
    return { success: false, error: "Review feedback comment cannot be empty." };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase not configured." };
  }

  try {
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: review.reviewerId,
      target_id: review.targetId,
      session_id: review.sessionId || null,
      rating: Math.round(review.rating),
      comment: review.comment.trim(),
    });

    if (error) throw error;

    // Notify reviewed student
    await createNotificationInDb({
      userId: review.targetId,
      type: "review_received",
      title: "New Peer Review Received",
      message: `A peer left you a ${Math.round(review.rating)}-star review for your collaboration.`,
      linkTab: "profile",
    });

    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error submitting review:", err);
    return { success: false, error: err.message };
  }
}

// -----------------------------------------------------------------------------
// ADMIN ROLES & MODERATION SERVICES
// -----------------------------------------------------------------------------

export interface AdminRoleRecord {
  id: string;
  userId: string;
  role: "admin" | "super_admin" | "moderator";
  grantedBy?: string;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetUserId?: string;
  targetProjectId?: string;
  reportedUserName?: string;
  reason: string;
  details?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

/**
 * Validates whether the given user possesses an active role in public.admin_roles
 */
export async function checkUserAdminRole(
  userId: string
): Promise<{ isAdmin: boolean; role: "admin" | "super_admin" | "moderator" | "student" }> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { isAdmin: false, role: "student" };
  }

  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return { isAdmin: false, role: "student" };
    }

    const roleName = data.role as "admin" | "super_admin" | "moderator";
    return {
      isAdmin: true,
      role: roleName,
    };
  } catch (err) {
    console.warn("[DataService] admin_roles check:", err);
    return { isAdmin: false, role: "student" };
  }
}

/**
 * Retrieves all assigned admin roles (requires admin permissions in Supabase RLS)
 */
export async function fetchAdminRoles(
  requesterUserId: string
): Promise<AdminRoleRecord[]> {
  if (!isSupabaseConfigured || !supabase || !requesterUserId) return [];

  try {
    const adminCheck = await checkUserAdminRole(requesterUserId);
    if (!adminCheck.isAdmin) {
      console.warn("[Admin] Unauthorized attempt to fetch admin roles by user:", requesterUserId);
      return [];
    }

    const { data, error } = await supabase
      .from("admin_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      role: r.role,
      grantedBy: r.granted_by,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[DataService] Error fetching admin roles:", err);
    return [];
  }
}

/**
 * Grants an admin or moderator role to a user. Strictly guarded by admin verification.
 */
export async function assignAdminRole(
  requesterUserId: string,
  targetUserId: string,
  role: "admin" | "moderator"
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const adminCheck = await checkUserAdminRole(requesterUserId);
    if (!adminCheck.isAdmin) {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const { error } = await supabase.from("admin_roles").upsert(
      {
        user_id: targetUserId,
        role: role,
        granted_by: requesterUserId,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error assigning admin role:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Revokes an admin role from a user. Strictly guarded by admin verification.
 */
export async function revokeAdminRole(
  requesterUserId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Database not configured." };
  }

  try {
    const adminCheck = await checkUserAdminRole(requesterUserId);
    if (!adminCheck.isAdmin) {
      return { success: false, error: "Unauthorized: Administrator privileges required." };
    }

    const { error } = await supabase
      .from("admin_roles")
      .delete()
      .eq("user_id", targetUserId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("[DataService] Error revoking admin role:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches moderation reports from the database. Strictly guarded by admin check.
 */
export async function fetchModerationReports(
  requesterUserId: string
): Promise<ModerationReport[]> {
  if (!isSupabaseConfigured || !supabase || !requesterUserId) return [];

  try {
    const adminCheck = await checkUserAdminRole(requesterUserId);
    if (!adminCheck.isAdmin) {
      console.warn("[Admin] Unauthorized attempt to fetch reports:", requesterUserId);
      return [];
    }

    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        target_user:target_user_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((r: any) => ({
      id: r.id,
      reporterId: r.reporter_id,
      targetUserId: r.target_user_id,
      targetProjectId: r.target_project_id,
      reportedUserName: r.target_user?.full_name || "Community Member",
      reason: r.reason,
      details: r.details,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch (err) {
    console.warn("[DataService] reports table note:", err);
    return [];
  }
}

/**
 * Updates status of a moderation report. Strictly guarded by admin check.
 */
export async function updateReportStatus(
  requesterUserId: string,
  reportId: string,
  status: "reviewed" | "resolved" | "dismissed"
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !requesterUserId) return false;

  try {
    const adminCheck = await checkUserAdminRole(requesterUserId);
    if (!adminCheck.isAdmin) return false;

    const { error } = await supabase
      .from("reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    return !error;
  } catch {
    return false;
  }
}
