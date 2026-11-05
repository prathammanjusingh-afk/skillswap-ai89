import { ArrowRight } from 'lucide-react'
import { CtaLink } from './cta-link'

export function CtaBanner() {
  return (
    <section id="get-started" className="section-y scroll-mt-16" aria-labelledby="cta-title">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-foreground md:px-16 md:py-20">
          <div
            className="bg-gradient-brand pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 id="cta-title" className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Your next great project starts with the{' '}
              <span className="font-serif font-normal italic">right people</span>
            </h2>
            <p className="text-pretty text-lg text-primary-foreground/70">
              Join thousands of students building balanced, high-performing teams.
            </p>
            <CtaLink href="#" variant="light" size="lg">
              Get Started for free
              <ArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  )
}
