import { Check, GraduationCap, Plus, Sparkles } from 'lucide-react'
import { currentStudent, exampleTeam, type Teammate } from '@/lib/site-data'
import { SectionHeading } from './section-heading'
import { Avatar, SkillChip } from './avatar'

export function MatchPreview() {
  return (
    <section id="matching" className="section-y scroll-mt-16 bg-surface" aria-labelledby="matching-title">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="matching-title"
            align="left"
            eyebrow="Matching preview"
            title="See who completes your team"
            description="Every suggestion comes with a clear reason: which of your skill gaps they fill and how well your schedules overlap."
          />
          <ul className="flex flex-col gap-3">
            {['Skill gap analysis', 'Working-style compatibility', 'Availability overlap'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-foreground/80">
                <span className="flex size-6 items-center justify-center rounded-full bg-highlight-soft text-[oklch(0.42_0.09_180)]">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div
            className="bg-gradient-brand pointer-events-none absolute -inset-4 rounded-[2rem] opacity-15 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-2xl shadow-foreground/5 md:p-7">
            <ProjectSummary />
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4 text-brand" aria-hidden="true" />
              Top matches for you
            </div>
            <ul className="flex flex-col gap-3">
              {exampleTeam.map((mate) => (
                <TeammateRow key={mate.name} mate={mate} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProjectSummary() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Avatar initials="YO" tone="ink" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Project</p>
          <p className="truncate font-semibold">{currentStudent.project}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {currentStudent.needs.map((need) => (
          <SkillChip key={need} variant="brand">
            Needs {need}
          </SkillChip>
        ))}
      </div>
    </div>
  )
}

function TeammateRow({ mate }: { mate: Teammate }) {
  return (
    <li className="group flex flex-col gap-4 rounded-2xl border border-border p-4 transition-all duration-300 hover:border-brand/30 hover:bg-brand-soft/40 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3">
        <Avatar initials={mate.initials} tone={mate.tone} />
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2">
            <p className="font-semibold">{mate.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5" aria-hidden="true" />
              {mate.major} · {mate.university}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mate.skills.map((skill) => (
              <SkillChip key={skill}>{skill}</SkillChip>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <MatchScore value={mate.match} />
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-all duration-300 hover:border-transparent hover:bg-gradient-brand hover:text-brand-foreground"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only">Invite {mate.name}</span>
        </button>
      </div>
    </li>
  )
}

function MatchScore({ value }: { value: number }) {
  return (
    <div className="flex w-28 flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">Match</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Match score"
      >
        <div className="bg-gradient-brand h-full rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
