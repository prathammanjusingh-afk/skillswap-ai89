'use client'

import { useState } from 'react'
import { Check, Clock, Sparkles, UserPlus } from 'lucide-react'
import type { RecommendedTeammate } from '@/lib/app-data'
import { Avatar, SkillChip } from '@/components/site/avatar'
import { cn } from '@/lib/utils'

export function TeammateCard({ teammate }: { teammate: RecommendedTeammate }) {
  const [invited, setInvited] = useState(false)

  return (
    <article className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-xl hover:shadow-brand/10">
      <div
        aria-hidden="true"
        className="bg-gradient-brand absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials={teammate.initials} tone={teammate.tone} />
          <div className="flex flex-col">
            <h3 className="font-semibold leading-tight">{teammate.name}</h3>
            <p className="text-xs text-muted-foreground">
              {teammate.major} · {teammate.university}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-highlight-soft px-2 py-0.5 text-xs font-semibold text-[oklch(0.42_0.09_180)]">
          {teammate.match}%<span className="sr-only"> match</span>
        </span>
      </div>

      <p className="flex items-center gap-1.5 text-sm text-foreground/80">
        <Sparkles className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
        {teammate.reason}
      </p>

      <ul className="flex flex-wrap gap-1.5" aria-label={`${teammate.name}'s skills`}>
        {teammate.skills.map((skill) => (
          <li key={skill}>
            <SkillChip>{skill}</SkillChip>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {teammate.availability}
        </span>
        <button
          type="button"
          onClick={() => setInvited(true)}
          disabled={invited}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all duration-300',
            invited
              ? 'bg-highlight-soft text-[oklch(0.42_0.09_180)]'
              : 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90',
          )}
        >
          {invited ? <Check className="size-3.5" aria-hidden="true" /> : <UserPlus className="size-3.5" aria-hidden="true" />}
          {invited ? 'Invited' : 'Invite'}
        </button>
      </div>
    </article>
  )
}
