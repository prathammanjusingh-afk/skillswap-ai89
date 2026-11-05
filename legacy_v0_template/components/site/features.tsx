import { features, type Feature } from '@/lib/site-data'
import { SectionHeading } from './section-heading'

export function Features() {
  return (
    <section id="features" className="section-y scroll-mt-16" aria-labelledby="features-title">
      <div className="container-page flex flex-col gap-14">
        <SectionHeading
          id="features-title"
          eyebrow="Features"
          title={
            <>
              Everything your team needs to{' '}
              <span className="text-gradient-brand font-serif font-normal italic">click</span>
            </>
          }
          description="Thoughtful tools designed around how students actually collaborate."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
      <div
        className="bg-gradient-brand pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-5">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-brand transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-pretty leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </article>
  )
}
