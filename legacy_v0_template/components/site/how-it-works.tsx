import { steps } from '@/lib/site-data'
import { SectionHeading } from './section-heading'

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-y scroll-mt-16 bg-surface" aria-labelledby="how-title">
      <div className="container-page flex flex-col gap-14">
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          title="From solo to squad in three steps"
          description="No more awkward group chats or random assignments. Tell us who you are and we will handle the rest."
        />

        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="group relative flex flex-col items-center gap-5 rounded-3xl border border-border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/10"
            >
              <div className="relative">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors duration-300 group-hover:bg-gradient-brand group-hover:text-brand-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
              <p className="text-pretty leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
