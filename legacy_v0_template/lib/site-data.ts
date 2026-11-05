import {
  BrainCircuit,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react'

export type NavLink = { label: string; href: string }

export const navLinks: NavLink[] = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Matching', href: '#matching' },
]

export type Step = { icon: LucideIcon; title: string; description: string }

export const steps: Step[] = [
  {
    icon: UserRoundSearch,
    title: 'Share your skills',
    description:
      'Build a profile in minutes. Add what you are great at, what you want to learn, and the kind of projects that excite you.',
  },
  {
    icon: BrainCircuit,
    title: 'Get matched by AI',
    description:
      'Our model analyzes skill gaps, working styles, and availability to suggest teammates who genuinely complement you.',
  },
  {
    icon: Rocket,
    title: 'Build together',
    description:
      'Kick off with a shared workspace, clear roles, and a project plan tailored to the strengths of your new team.',
  },
]

export type Feature = { icon: LucideIcon; title: string; description: string }

export const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'Complementary matching',
    description:
      'Find people who fill your gaps, not mirror your strengths. Balanced teams ship better work.',
  },
  {
    icon: CalendarClock,
    title: 'Schedule-aware',
    description:
      'Matches respect class timetables and time zones so collaboration actually fits your week.',
  },
  {
    icon: MessagesSquare,
    title: 'Built-in team space',
    description:
      'Chat, share files, and track milestones in one place from the moment your team forms.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified students',
    description:
      'Every member is verified with a university email, keeping the community focused and safe.',
  },
]

export type Teammate = {
  name: string
  initials: string
  major: string
  university: string
  skills: string[]
  match: number
  tone: 'brand' | 'highlight' | 'ink'
}

export const exampleTeam: Teammate[] = [
  {
    name: 'Maya Chen',
    initials: 'MC',
    major: 'Product Design',
    university: 'RISD',
    skills: ['Figma', 'User Research', 'Prototyping'],
    match: 96,
    tone: 'brand',
  },
  {
    name: 'Jordan Ellis',
    initials: 'JE',
    major: 'Computer Science',
    university: 'Georgia Tech',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    match: 92,
    tone: 'highlight',
  },
  {
    name: 'Priya Nair',
    initials: 'PN',
    major: 'Business Analytics',
    university: 'UT Austin',
    skills: ['Market Sizing', 'Pitching', 'SQL'],
    match: 89,
    tone: 'ink',
  },
]

export const currentStudent = {
  name: 'You',
  project: 'Campus food-waste tracker',
  has: ['Machine Learning', 'Python'],
  needs: ['UI Design', 'Frontend', 'Go-to-market'],
}

export const stats = [
  { value: '12k+', label: 'Students matched' },
  { value: '340', label: 'Universities' },
  { value: '94%', label: 'Teams finish projects' },
]

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Matching', href: '#matching' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help center', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]
