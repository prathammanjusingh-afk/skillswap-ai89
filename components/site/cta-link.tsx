import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const ctaVariants = cva(
  'group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/40 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-brand text-brand-foreground shadow-lg shadow-brand/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30',
        dark: 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90',
        outline:
          'border border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand-soft',
        light: 'bg-card text-foreground hover:-translate-y-0.5 hover:bg-brand-soft',
        ghost: 'text-foreground hover:bg-muted',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type CtaLinkProps = React.ComponentProps<typeof Link> & VariantProps<typeof ctaVariants>

export function CtaLink({ className, variant, size, ...props }: CtaLinkProps) {
  return <Link className={cn(ctaVariants({ variant, size }), className)} {...props} />
}
