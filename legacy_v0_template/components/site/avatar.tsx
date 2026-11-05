import { cn } from '@/lib/utils'
import type { Teammate } from '@/lib/site-data'

const toneClasses: Record<Teammate['tone'], string> = {
  brand: 'bg-brand text-brand-foreground',
  highlight: 'bg-highlight text-primary',
  ink: 'bg-primary text-primary-foreground',
}

type AvatarProps = {
  initials: string
  tone?: Teammate['tone']
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ initials, tone = 'brand', size = 'md', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-4 ring-card',
        size === 'sm' && 'size-8 text-xs',
        size === 'md' && 'size-11 text-sm',
        size === 'lg' && 'size-14 text-base',
        toneClasses[tone],
        className,
      )}
    >
      {initials}
    </span>
  )
}

export function SkillChip({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: 'default' | 'brand' | 'highlight'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'border-border bg-surface text-foreground/80',
        variant === 'brand' && 'border-brand/15 bg-brand-soft text-brand',
        variant === 'highlight' && 'border-highlight/25 bg-highlight-soft text-[oklch(0.42_0.09_180)]',
        className,
      )}
    >
      {children}
    </span>
  )
}
