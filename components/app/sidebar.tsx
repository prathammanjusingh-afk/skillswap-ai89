'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronsLeft, Shuffle, Sparkles, X } from 'lucide-react'
import { appNav } from '@/lib/app-data'
import { cn } from '@/lib/utils'

type SidebarProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onCloseMobile}
        className={cn(
          'fixed inset-0 z-40 bg-primary/30 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-[transform,width] duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed && 'lg:w-20',
        )}
      >
        <div className={cn('flex h-16 items-center gap-2 border-b border-border px-5', collapsed && 'lg:justify-center lg:px-0')}>
          <Link
            href="/"
            aria-label="SkillSwap AI home"
            className="group inline-flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-gradient-brand flex size-8 shrink-0 items-center justify-center rounded-lg text-brand-foreground shadow-sm shadow-brand/30 transition-transform duration-300 group-hover:rotate-12">
              <Shuffle className="size-4" aria-hidden="true" />
            </span>
            <span className={cn('text-lg', collapsed && 'lg:sr-only')}>
              SkillSwap <span className="text-brand">AI</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close navigation</span>
          </button>
        </div>

        <nav aria-label="App" className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="flex flex-col gap-1">
            {appNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-soft text-brand'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'lg:justify-center lg:px-0',
                    )}
                  >
                    {active && (
                      <span aria-hidden="true" className="bg-gradient-brand absolute inset-y-2 left-0 w-1 rounded-r-full" />
                    )}
                    <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
                    <span className={cn('flex-1 truncate', collapsed && 'lg:sr-only')}>{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          'inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[0.6875rem] font-semibold leading-5 text-brand-foreground',
                          collapsed && 'lg:absolute lg:right-3 lg:top-1 lg:min-w-4 lg:px-1 lg:leading-4',
                        )}
                      >
                        {item.badge}
                        <span className="sr-only"> unread</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-border p-3">
          <div
            className={cn(
              'relative overflow-hidden rounded-xl border border-brand/15 bg-brand-soft p-4',
              collapsed && 'lg:hidden',
            )}
          >
            <div aria-hidden="true" className="bg-gradient-brand absolute -right-6 -top-6 size-20 rounded-full opacity-20 blur-xl" />
            <Sparkles className="size-4 text-brand" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold">Boost your matches</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add two more skills to unlock 12 new teammate suggestions.
            </p>
            <Link href="/profile" className="mt-3 inline-flex text-xs font-semibold text-brand hover:underline">
              Update profile
            </Link>
          </div>

          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            className={cn(
              'hidden h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex',
              collapsed && 'justify-center px-0',
            )}
          >
            <ChevronsLeft
              className={cn('size-[1.125rem] shrink-0 transition-transform duration-300', collapsed && 'rotate-180')}
              aria-hidden="true"
            />
            <span className={cn(collapsed && 'sr-only')}>{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
