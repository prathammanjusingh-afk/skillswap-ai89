import type { Metadata } from 'next'
import { activeProjects } from '@/lib/app-data'
import { PageHeader } from '@/components/app/page-header'
import { ProjectRow } from '@/components/dashboard/project-list'

export const metadata: Metadata = { title: 'Projects — SkillSwap AI' }

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Track progress and deadlines across every team you are on." />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeProjects.map((p) => (
          <li key={p.id} className="rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5">
            <ProjectRow project={p} />
          </li>
        ))}
      </ul>
    </>
  )
}
