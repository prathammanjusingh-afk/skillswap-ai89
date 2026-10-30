'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/lib/site-data'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { CtaLink } from './cta-link'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <CtaLink href="#" variant="ghost" size="sm">
            Login
          </CtaLink>
          <CtaLink href="#get-started" variant="dark" size="sm">
            Get Started
          </CtaLink>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          'grid overflow-hidden border-border/60 transition-[grid-template-rows] duration-300 md:hidden',
          open ? 'grid-rows-[1fr] border-t' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0">
          <div className="container-page flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <CtaLink href="#" variant="outline" size="md" onClick={() => setOpen(false)}>
                Login
              </CtaLink>
              <CtaLink href="#get-started" variant="dark" size="md" onClick={() => setOpen(false)}>
                Get Started
              </CtaLink>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
