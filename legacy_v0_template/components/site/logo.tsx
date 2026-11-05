import Link from 'next/link'
import { Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2 font-semibold tracking-tight', className)}
      aria-label="SkillSwap AI home"
    >
      <span className="bg-gradient-brand flex size-8 items-center justify-center rounded-lg text-brand-foreground shadow-sm shadow-brand/30 transition-transform duration-300 group-hover:rotate-12">
        <Shuffle className="size-4" aria-hidden="true" />
      </span>
      <span className="text-lg">
        SkillSwap <span className="text-brand">AI</span>
      </span>
    </Link>
  )
}
