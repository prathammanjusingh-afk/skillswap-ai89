'use client'

import { useState } from 'react'
import { Check, Inbox, X } from 'lucide-react'
import type { CollaborationRequest } from '@/lib/app-data'
import { Avatar } from '@/components/site/avatar'

type Decision = 'accepted' | 'declined'

export function RequestList({ requests }: { requests: CollaborationRequest[] }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const pending = requests.filter((r) => !decisions[r.id])
  const decide = (id: string, decision: Decision) => setDecisions((d) => ({ ...d, [id]: decision }))

  return (
    <div className="flex flex-col gap-3">
      <p className="sr-only" aria-live="polite">
        {pending.length} pending requests
      </p>
      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
          <Inbox className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium">{"You're all caught up"}</p>
          <p className="text-xs text-muted-foreground">New collaboration requests will appear here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((req) => (
            <li
              key={req.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand/20 hover:bg-surface"
            >
              <div className="flex items-start gap-3">
                <Avatar initials={req.initials} tone={req.tone} size="sm" className="ring-2" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{req.name}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{req.sent}</span>
                  </div>
                  <p className="text-xs font-medium text-brand">{req.project}</p>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{req.message}</p>
                </div>
              </div>
              <div className="flex gap-2 pl-11">
                <button
                  type="button"
                  onClick={() => decide(req.id, 'accepted')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-brand px-3 text-xs font-semibold text-brand-foreground shadow-sm shadow-brand/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/30"
                >
                  <Check className="size-3.5" aria-hidden="true" />
                  Accept<span className="sr-only"> request from {req.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => decide(req.id, 'declined')}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Decline<span className="sr-only"> request from {req.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
