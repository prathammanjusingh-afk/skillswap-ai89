import { StudentProfile, Project, CollaborationRequest } from "@/types";
import { MOCK_CURRENT_USER, MOCK_STUDENTS, MOCK_PROJECTS, MOCK_REQUESTS } from "./mock-data";

const KEYS = {
  CURRENT_USER: "skillswap_current_user_v1",
  STUDENTS: "skillswap_students_v1",
  PROJECTS: "skillswap_projects_v1",
  REQUESTS: "skillswap_requests_v1",
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadStoredCurrentUser(): StudentProfile {
  if (!isClient()) return MOCK_CURRENT_USER;
  try {
    const raw = localStorage.getItem(KEYS.CURRENT_USER);
    if (!raw) return MOCK_CURRENT_USER;
    return JSON.parse(raw) as StudentProfile;
  } catch (e) {
    console.error("Failed to load current user from storage", e);
    return MOCK_CURRENT_USER;
  }
}

export function saveStoredCurrentUser(user: StudentProfile): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save current user to storage", e);
  }
}

export function loadStoredStudents(): StudentProfile[] {
  if (!isClient()) return MOCK_STUDENTS;
  try {
    const raw = localStorage.getItem(KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(MOCK_STUDENTS));
      return MOCK_STUDENTS;
    }
    return JSON.parse(raw) as StudentProfile[];
  } catch (e) {
    console.error("Failed to load students from storage", e);
    return MOCK_STUDENTS;
  }
}

export function saveStoredStudents(students: StudentProfile[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error("Failed to save students to storage", e);
  }
}

export function loadStoredProjects(): Project[] {
  if (!isClient()) return MOCK_PROJECTS;
  try {
    const raw = localStorage.getItem(KEYS.PROJECTS);
    if (!raw) {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
      return MOCK_PROJECTS;
    }
    return JSON.parse(raw) as Project[];
  } catch (e) {
    console.error("Failed to load projects from storage", e);
    return MOCK_PROJECTS;
  }
}

export function saveStoredProjects(projects: Project[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error("Failed to save projects to storage", e);
  }
}

export function loadStoredRequests(): CollaborationRequest[] {
  if (!isClient()) return MOCK_REQUESTS;
  try {
    const raw = localStorage.getItem(KEYS.REQUESTS);
    if (!raw) {
      localStorage.setItem(KEYS.REQUESTS, JSON.stringify(MOCK_REQUESTS));
      return MOCK_REQUESTS;
    }
    return JSON.parse(raw) as CollaborationRequest[];
  } catch (e) {
    console.error("Failed to load requests from storage", e);
    return MOCK_REQUESTS;
  }
}

export function saveStoredRequests(requests: CollaborationRequest[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error("Failed to save requests to storage", e);
  }
}

export function resetStorageToDefaults(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.PROJECTS);
    localStorage.removeItem(KEYS.REQUESTS);
  } catch (e) {
    console.error("Failed to reset storage", e);
  }
}
