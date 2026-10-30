import type { Metadata } from 'next'
import { recommendedTeammates } from '@/lib/app-data'
import { PageHeader } from '@/components/app/page-header'
import { TeammateCard } from '@/components/dashboard/teammate-card'

export const metadata: Metadata = { title: 'Discover — SkillSwap AI' }

export default function DiscoverPage() {
  return (
    <>
      <PageHeader title="Discover" description="Students whose strengths complement yours, ranked by match score." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendedTeammates.map((t) => (
          <TeammateCard key={t.name} teammate={t} />
        ))}
      </div>
    </>
  )
}
