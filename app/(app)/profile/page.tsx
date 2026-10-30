import type { Metadata } from 'next'
import { learningGoals, mySkills, viewer } from '@/lib/app-data'
import { PageHeader } from '@/components/app/page-header'
import { WidgetCard } from '@/components/dashboard/widget-card'
import { SkillsSummary } from '@/components/dashboard/skills-summary'
import { Avatar } from '@/components/site/avatar'

export const metadata: Metadata = { title: 'Profile — SkillSwap AI' }

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="How other students see you on SkillSwap AI." />
      <div className="grid gap-6 lg:grid-cols-3">
        <section
          aria-label="Profile overview"
          className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center"
        >
          <div aria-hidden="true" className="bg-gradient-brand absolute inset-x-0 top-0 h-20 opacity-90" />
          <Avatar initials={viewer.initials} tone={viewer.tone} size="lg" className="relative mt-6" />
          <div className="relative">
            <p className="text-lg font-semibold">{viewer.name}</p>
            <p className="text-sm text-muted-foreground">
              {viewer.year} · {viewer.major}
            </p>
            <p className="text-sm text-muted-foreground">{viewer.university}</p>
          </div>
        </section>
        <WidgetCard title="Skills" className="lg:col-span-2">
          <SkillsSummary skills={mySkills} learning={learningGoals} />
        </WidgetCard>
      </div>
    </>
  )
}
