import type { Metadata } from 'next'
import { recommendedTeammates } from '@/lib/app-data'
import { PageHeader } from '@/components/app/page-header'
import { WidgetCard } from '@/components/dashboard/widget-card'
import { Avatar, SkillChip } from '@/components/site/avatar'
import { CtaLink } from '@/components/site/cta-link'

export const metadata: Metadata = { title: 'My Team — SkillSwap AI' }

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="My Team"
        description="The people you are building Campus food-waste tracker with."
        actions={
          <CtaLink href="/discover" size="sm">
            Find teammates
          </CtaLink>
        }
      />
      <WidgetCard title="Team members" description={`${recommendedTeammates.length} collaborators`}>
        <ul className="flex flex-col divide-y divide-border">
          {recommendedTeammates.map((m) => (
            <li key={m.name} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar initials={m.initials} tone={m.tone} />
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.major} · {m.university}
                  </p>
                </div>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {m.skills.map((s) => (
                  <li key={s}>
                    <SkillChip>{s}</SkillChip>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </WidgetCard>
    </>
  )
}
