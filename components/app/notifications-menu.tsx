'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { notifications } from '@/lib/app-data'
import { cn } from '@/lib/utils'

export function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => n.unread).length

  useEffect(() => {
    if (!open) return
    const handlePointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="notifications-panel"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-card" />
        )}
        <span className="sr-only">Notifications, {unreadCount} unread</span>
      </button>

      <div
        id="notifications-panel"
        role="region"
        aria-label="Notifications"
        hidden={!open}
        className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-primary/5"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <span className="text-xs text-muted-foreground">{unreadCount} new</span>
        </div>
        <ul className="divide-y divide-border">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface">
              <span
                aria-hidden="true"
                className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.unread ? 'bg-brand' : 'bg-border')}
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
