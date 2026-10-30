import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import type { Project, ProjectStatus } from '@/lib/app-data'
import { Avatar } from '@/components/site/avatar'
import { cn } from '@/lib/utils'
import { ProgressBar } from './widget-card'

const statusClasses: Record<ProjectStatus, string> = {
  'On track': 'bg-highlight-soft text-[oklch(0.42_0.09_180)]',
  'At risk': 'bg-destructive/10 text-destructive',
  Planning: 'bg-brand-soft text-brand',
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {projects.map((project) => (
        <li key={project.id} className="first:pt-0 last:pb-0 py-4">
          <ProjectRow project={project} />
        </li>
      ))}
    </ul>
  )
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href="/projects"
      className="group -mx-3 flex flex-col gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-medium transition-colors group-hover:text-brand">{project.name}</p>
          <p className="text-xs text-muted-foreground">{project.course}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', statusClasses[project.status])}>
          {project.status}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar value={project.progress} label={`${project.name} progress`} />
        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{project.progress}%</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.members.map((m) => (
            <Avatar key={m.initials} initials={m.initials} tone={m.tone} size="sm" className="size-7 text-[0.625rem] ring-2" />
          ))}
          <span className="sr-only">{project.members.length} members</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Due {project.due}
        </span>
      </div>
    </Link>
  )
}
