import { Code2, Megaphone, Palette, Sparkles, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Node = {
  icon: LucideIcon
  label: string
  position: string
  tone: string
  delay: string
}

const nodes: Node[] = [
  { icon: Palette, label: 'Design', position: 'left-[6%] top-[14%]', tone: 'text-brand', delay: '[animation-delay:0s]' },
  { icon: Code2, label: 'Engineering', position: 'right-[4%] top-[20%]', tone: 'text-highlight', delay: '[animation-delay:1.2s]' },
  { icon: BarChart3, label: 'Data', position: 'left-[10%] bottom-[12%]', tone: 'text-highlight', delay: '[animation-delay:2.4s]' },
  { icon: Megaphone, label: 'Marketing', position: 'right-[8%] bottom-[16%]', tone: 'text-brand', delay: '[animation-delay:3.6s]' },
]

export function CollaborationIllustration({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative mx-auto aspect-square w-full max-w-md', className)}
      role="img"
      aria-label="Illustration of four students with different skills connected through an AI matching hub"
    >
      <div className="absolute inset-[8%] rounded-full bg-gradient-brand opacity-15 blur-3xl" />

      <div className="absolute inset-[14%] rounded-full border border-dashed border-brand/25" />
      <div className="absolute inset-[30%] rounded-full border border-highlight/30" />

      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="link-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--highlight)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {[
          [20, 22],
          [82, 27],
          [22, 80],
          [80, 76],
        ].map(([x, y]) => (
          <line
            key={`${x}-${y}`}
            x1="50"
            y1="50"
            x2={x}
            y2={y}
            stroke="url(#link-gradient)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 animate-pulse-ring rounded-3xl bg-brand/30" />
        <div className="bg-gradient-brand relative flex size-24 flex-col items-center justify-center gap-1 rounded-3xl text-brand-foreground shadow-2xl shadow-brand/40 md:size-28">
          <Sparkles className="size-7" aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wide">AI Match</span>
        </div>
      </div>

      {nodes.map(({ icon: Icon, label, position, tone, delay }) => (
        <div key={label} className={cn('absolute animate-float', position, delay)}>
          <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card/90 p-2.5 pr-4 shadow-lg shadow-foreground/5 backdrop-blur transition-transform duration-300 hover:scale-105">
            <span className={cn('flex size-9 items-center justify-center rounded-xl bg-surface', tone)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{label}</span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-[2%] -translate-x-1/2 rounded-full border border-highlight/30 bg-highlight-soft px-3 py-1 text-xs font-medium text-[oklch(0.42_0.09_180)] shadow-sm">
        96% team fit
      </div>
    </div>
  )
}
