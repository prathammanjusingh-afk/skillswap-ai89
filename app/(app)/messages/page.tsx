import type { Metadata } from 'next'
import { pendingRequests } from '@/lib/app-data'
import { PageHeader } from '@/components/app/page-header'
import { WidgetCard } from '@/components/dashboard/widget-card'
import { RequestList } from '@/components/dashboard/request-list'

export const metadata: Metadata = { title: 'Messages — SkillSwap AI' }

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" description="Collaboration requests and conversations with your teams." />
      <WidgetCard title="Collaboration requests" description="Respond to students who want to work with you.">
        <RequestList requests={pendingRequests} />
      </WidgetCard>
    </>
  )
}
