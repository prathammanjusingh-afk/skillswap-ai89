import { ArrowRight, PlayCircle } from 'lucide-react'
import { stats } from '@/lib/site-data'
import { CtaLink } from './cta-link'
import { Eyebrow } from './section-heading'
import { CollaborationIllustration } from './collaboration-illustration'

export function Hero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-12 pb-20 pt-16 md:pb-28 md:pt-24 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col items-start gap-6">
          <Eyebrow>AI-powered team matching</Eyebrow>

          <h1
            id="hero-title"
            className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          >
            Find Your <span className="text-gradient-brand font-serif font-normal italic">Perfect</span> Team
          </h1>

          <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            SkillSwap AI matches you with students whose skills complement yours, so every project
            has the designer, the developer, and the strategist it needs to succeed.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaLink href="#get-started" size="lg">
              Find my teammates
              <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </CtaLink>
            <CtaLink href="#how-it-works" variant="outline" size="lg">
              <PlayCircle aria-hidden="true" />
              See how it works
            </CtaLink>
          </div>

          <dl className="mt-4 grid w-full max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="text-xs text-muted-foreground md:text-sm">{stat.label}</dt>
                <dd className="order-first text-2xl font-semibold tracking-tight md:text-3xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <CollaborationIllustration />
      </div>
    </section>
  )
}
