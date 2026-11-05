import { describe, it, expect } from "vitest";

interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  done: boolean;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
}

interface ProjectChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
}

function toggleTaskStatus(task: ProjectTask): ProjectTask {
  return {
    ...task,
    done: !task.done,
  };
}

function validateTaskCreation(
  title: string,
  projectId: string,
  creatorId: string,
  projectMemberIds: string[]
): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: "Task title cannot be empty" };
  }
  if (!projectId) {
    return { valid: false, error: "Project ID is required" };
  }
  if (!projectMemberIds.includes(creatorId)) {
    return { valid: false, error: "Only project contributors can create tasks" };
  }
  return { valid: true };
}

function validateProjectMessage(
  content: string,
  senderId: string,
  projectMemberIds: string[]
): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Message content cannot be empty" };
  }
  if (content.length > 2000) {
    return { valid: false, error: "Message exceeds maximum length of 2000 characters" };
  }
  if (!projectMemberIds.includes(senderId)) {
    return { valid: false, error: "Only project members can post messages in Team Room" };
  }
  return { valid: true };
}

describe("Team Room & Project Task Management", () => {
  const sampleMembers = ["usr-owner", "usr-contributor-1", "usr-contributor-2"];

  it("validates task creation requires non-empty title and project contributor authorization", () => {
    // Non-member trying to create task
    const nonMemberResult = validateTaskCreation("Design Architecture", "proj-1", "usr-outsider", sampleMembers);
    expect(nonMemberResult.valid).toBe(false);
    expect(nonMemberResult.error).toContain("Only project contributors");

    // Empty title
    const emptyTitleResult = validateTaskCreation("   ", "proj-1", "usr-owner", sampleMembers);
    expect(emptyTitleResult.valid).toBe(false);
    expect(emptyTitleResult.error).toContain("Task title cannot be empty");

    // Valid task
    const validResult = validateTaskCreation("Implement Supabase RLS", "proj-1", "usr-contributor-1", sampleMembers);
    expect(validResult.valid).toBe(true);
    expect(validResult.error).toBeUndefined();
  });

  it("toggles task completion status accurately", () => {
    const task: ProjectTask = {
      id: "task-001",
      projectId: "proj-1",
      title: "Write Vitest unit tests",
      done: false,
      createdAt: new Date().toISOString(),
    };

    const completedTask = toggleTaskStatus(task);
    expect(completedTask.done).toBe(true);

    const reopenedTask = toggleTaskStatus(completedTask);
    expect(reopenedTask.done).toBe(false);
  });

  it("validates project chat messages are restricted to project members", () => {
    const outsiderResult = validateProjectMessage("Hello team", "usr-stranger", sampleMembers);
    expect(outsiderResult.valid).toBe(false);
    expect(outsiderResult.error).toContain("Only project members can post messages");

    const memberResult = validateProjectMessage("Sprint planning starts at 10 AM", "usr-contributor-2", sampleMembers);
    expect(memberResult.valid).toBe(true);
  });

  it("enforces message length constraints in Team Room chat", () => {
    const massiveContent = "A".repeat(2500);
    const oversizedResult = validateProjectMessage(massiveContent, "usr-owner", sampleMembers);
    expect(oversizedResult.valid).toBe(false);
    expect(oversizedResult.error).toContain("exceeds maximum length");
  });
});
