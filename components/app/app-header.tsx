'use client'

import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { viewer } from '@/lib/app-data'
import { Avatar } from '@/components/site/avatar'
import { NotificationsMenu } from './notifications-menu'

export function AppHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-xl md:px-8">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-controls="app-sidebar"
        className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">Open navigation</span>
      </button>

      <form role="search" className="relative max-w-md flex-1" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="app-search" className="sr-only">
          Search students, skills or projects
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="app-search"
          type="search"
          placeholder="Search students, skills, projects..."
          className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:bg-card focus:ring-3 focus:ring-ring/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <NotificationsMenu />
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-full p-1 transition-colors hover:bg-muted md:pr-3"
        >
          <Avatar initials={viewer.initials} tone={viewer.tone} size="sm" className="ring-2" />
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-sm font-medium">{viewer.name}</span>
            <span className="block text-xs text-muted-foreground">{viewer.major}</span>
          </span>
          <span className="sr-only md:hidden">Your profile</span>
        </Link>
      </div>
    </header>
  )
}
