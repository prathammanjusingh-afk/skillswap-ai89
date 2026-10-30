import { Compass, Plus } from 'lucide-react'
import { CtaLink } from '@/components/site/cta-link'

type WelcomeBannerProps = { firstName: string; newMatches: number; dueThisWeek: number }

export function WelcomeBanner({ firstName, newMatches, dueThisWeek }: WelcomeBannerProps) {
  return (
    <section
      aria-labelledby="welcome-heading"
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8"
    >
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_65%)]" />
      <div aria-hidden="true" className="bg-gradient-brand absolute -right-16 -top-20 size-64 rounded-full opacity-15 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <p className="text-sm font-medium text-brand">Thursday, October 30</p>
          <h1 id="welcome-heading" className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back, <span className="font-serif text-3xl italic text-gradient-brand md:text-4xl">{firstName}</span>
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            You have <strong className="font-semibold text-foreground">{newMatches} new teammate matches</strong> and{' '}
            <strong className="font-semibold text-foreground">{dueThisWeek} milestone</strong> due this week. Keep the momentum going.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CtaLink href="/discover" variant="primary" size="md">
            <Compass aria-hidden="true" />
            Discover teammates
          </CtaLink>
          <CtaLink href="/projects" variant="outline" size="md">
            <Plus aria-hidden="true" />
            New project
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
