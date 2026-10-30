import type { Metadata } from 'next'
import {
  activeProjects,
  dashboardStats,
  learningGoals,
  mySkills,
  pendingRequests,
  recommendedTeammates,
  viewer,
} from '@/lib/app-data'
import { WelcomeBanner } from '@/components/dashboard/welcome-banner'
import { StatGrid } from '@/components/dashboard/stat-grid'
import { WidgetCard } from '@/components/dashboard/widget-card'
import { TeammateCard } from '@/components/dashboard/teammate-card'
import { SkillsSummary } from '@/components/dashboard/skills-summary'
import { ProjectList } from '@/components/dashboard/project-list'
import { RequestList } from '@/components/dashboard/request-list'

export const metadata: Metadata = {
  title: 'Dashboard — SkillSwap AI',
}

export default function DashboardPage() {
  return (
    <>
      <WelcomeBanner firstName={viewer.firstName} newMatches={recommendedTeammates.length} dueThisWeek={1} />
      <StatGrid stats={dashboardStats} />

      <WidgetCard
        title="Recommended teammates"
        description="Matched to the skills your projects are missing."
        action={{ label: 'View all', href: '/discover' }}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedTeammates.map((t) => (
            <TeammateCard key={t.name} teammate={t} />
          ))}
        </div>
      </WidgetCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <WidgetCard
          title="Active projects"
          description={`${activeProjects.length} projects in progress`}
          action={{ label: 'All projects', href: '/projects' }}
          className="xl:col-span-2"
        >
          <ProjectList projects={activeProjects} />
        </WidgetCard>

        <WidgetCard title="My skills" action={{ label: 'Edit', href: '/profile' }}>
          <SkillsSummary skills={mySkills} learning={learningGoals} />
        </WidgetCard>
      </div>

      <WidgetCard
        title="Pending collaboration requests"
        description="Students who want you on their team."
        action={{ label: 'Messages', href: '/messages' }}
      >
        <RequestList requests={pendingRequests} />
      </WidgetCard>
    </>
  )
}
