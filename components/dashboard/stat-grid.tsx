import { Minus, TrendingUp } from 'lucide-react'
import type { DashboardStat } from '@/lib/app-data'
import { cn } from '@/lib/utils'

export function StatGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <section aria-label="Statistics">
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </dl>
    </section>
  )
}

export function StatCard({ stat }: { stat: DashboardStat }) {
  const TrendIcon = stat.trend === 'up' ? TrendingUp : Minus
  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/5 md:p-5">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
      <dd className="text-2xl font-semibold tracking-tight md:text-3xl">{stat.value}</dd>
      <dd
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium',
          stat.trend === 'up' ? 'text-[oklch(0.5_0.11_180)]' : 'text-muted-foreground',
        )}
      >
        <TrendIcon className="size-3.5" aria-hidden="true" />
        {stat.change}
      </dd>
    </div>
  )
}
