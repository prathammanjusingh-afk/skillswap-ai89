import {
  Compass,
  FolderKanban,
  LayoutDashboard,
  MessagesSquare,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { Teammate } from '@/lib/site-data'

export type AppNavItem = { label: string; href: string; icon: LucideIcon; badge?: number }

export const appNav: AppNavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'My Team', href: '/team', icon: UsersRound },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Messages', href: '/messages', icon: MessagesSquare, badge: 3 },
  { label: 'Profile', href: '/profile', icon: UserRound },
]

export const viewer = {
  name: 'Alex Rivera',
  firstName: 'Alex',
  initials: 'AR',
  major: 'Computer Science',
  university: 'University of Michigan',
  year: 'Junior',
  tone: 'ink' as Teammate['tone'],
}

export type DashboardStat = { label: string; value: string; change: string; trend: 'up' | 'flat' }

export const dashboardStats: DashboardStat[] = [
  { label: 'Match score', value: '94%', change: '+6% this month', trend: 'up' },
  { label: 'Active projects', value: '3', change: '1 due this week', trend: 'flat' },
  { label: 'Connections', value: '28', change: '+4 this week', trend: 'up' },
  { label: 'Hours collaborated', value: '46h', change: '+12h vs last month', trend: 'up' },
]

export type RecommendedTeammate = Teammate & { reason: string; availability: string }

export const recommendedTeammates: RecommendedTeammate[] = [
  {
    name: 'Maya Chen',
    initials: 'MC',
    major: 'Product Design',
    university: 'RISD',
    skills: ['Figma', 'User Research', 'Prototyping'],
    match: 96,
    tone: 'brand',
    reason: 'Fills your UI Design gap',
    availability: 'Evenings, EST',
  },
  {
    name: 'Jordan Ellis',
    initials: 'JE',
    major: 'Computer Science',
    university: 'Georgia Tech',
    skills: ['React', 'Next.js', 'Tailwind'],
    match: 92,
    tone: 'highlight',
    reason: 'Strong frontend, pairs with your ML',
    availability: 'Weekends',
  },
  {
    name: 'Priya Nair',
    initials: 'PN',
    major: 'Business Analytics',
    university: 'UT Austin',
    skills: ['Go-to-market', 'Pitching', 'SQL'],
    match: 89,
    tone: 'ink',
    reason: 'Covers go-to-market strategy',
    availability: 'Afternoons, CST',
  },
]

export type SkillLevel = { name: string; level: number }

export const mySkills: SkillLevel[] = [
  { name: 'Machine Learning', level: 88 },
  { name: 'Python', level: 92 },
  { name: 'Data Visualization', level: 74 },
  { name: 'Technical Writing', level: 61 },
]

export const learningGoals = ['UI Design', 'Frontend', 'Go-to-market']

export type ProjectStatus = 'On track' | 'At risk' | 'Planning'

export type Project = {
  id: string
  name: string
  course: string
  progress: number
  status: ProjectStatus
  due: string
  members: { initials: string; tone: Teammate['tone'] }[]
}

export const activeProjects: Project[] = [
  {
    id: 'food-waste',
    name: 'Campus food-waste tracker',
    course: 'EECS 497 · Capstone',
    progress: 68,
    status: 'On track',
    due: 'Nov 14',
    members: [
      { initials: 'AR', tone: 'ink' },
      { initials: 'MC', tone: 'brand' },
      { initials: 'JE', tone: 'highlight' },
    ],
  },
  {
    id: 'study-buddy',
    name: 'Study Buddy scheduler',
    course: 'SI 539 · Web Design',
    progress: 41,
    status: 'At risk',
    due: 'Nov 3',
    members: [
      { initials: 'AR', tone: 'ink' },
      { initials: 'SK', tone: 'highlight' },
    ],
  },
  {
    id: 'climate-viz',
    name: 'Climate data storytelling',
    course: 'Hackathon · MHacks',
    progress: 12,
    status: 'Planning',
    due: 'Dec 2',
    members: [
      { initials: 'AR', tone: 'ink' },
      { initials: 'PN', tone: 'ink' },
      { initials: 'LT', tone: 'brand' },
      { initials: 'DO', tone: 'highlight' },
    ],
  },
]

export type CollaborationRequest = {
  id: string
  name: string
  initials: string
  tone: Teammate['tone']
  project: string
  message: string
  sent: string
}

export const pendingRequests: CollaborationRequest[] = [
  {
    id: 'req-1',
    name: 'Sam Okafor',
    initials: 'SO',
    tone: 'highlight',
    project: 'AR campus tour',
    message: 'Looking for an ML lead to handle landmark recognition.',
    sent: '2h ago',
  },
  {
    id: 'req-2',
    name: 'Lena Torres',
    initials: 'LT',
    tone: 'brand',
    project: 'Mental health check-in bot',
    message: 'Your NLP experience would be a huge help on our intent model.',
    sent: 'Yesterday',
  },
  {
    id: 'req-3',
    name: 'Daniel Osei',
    initials: 'DO',
    tone: 'ink',
    project: 'Sustainable housing map',
    message: 'Need someone to own data pipelines for city datasets.',
    sent: '2 days ago',
  },
]

export type AppNotification = { id: string; title: string; time: string; unread: boolean }

export const notifications: AppNotification[] = [
  { id: 'n1', title: 'Maya Chen accepted your invite', time: '10m ago', unread: true },
  { id: 'n2', title: 'New 96% match available', time: '1h ago', unread: true },
  { id: 'n3', title: 'Study Buddy milestone due Nov 3', time: 'Yesterday', unread: false },
]
