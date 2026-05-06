// app/(farmer)/notifications/page.tsx
// Notifications — reads from the notifications table filtered to the current
// farmer (recipient_id = user.id OR target_role = 'farmer').
// Server Component — data fetched at request time.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Notification } from '@/types'
import { Bell, AlertTriangle, Info, TrendingDown, TrendingUp, BookOpen, Settings } from 'lucide-react'

export const metadata = {
  title: 'Notifications — NHPMS',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type NotificationIconConfig = {
  icon: React.ElementType
  bg: string
  color: string
}

function getIconConfig(type: Notification['type'], severity: Notification['severity']): NotificationIconConfig {
  if (severity === 'critical' || type === 'shortage_alert') {
    return { icon: AlertTriangle, bg: 'bg-[var(--status-failed-bg)]', color: 'text-[var(--status-failed)]' }
  }
  if (severity === 'warning' || type === 'surplus_alert' || type === 'market_alert') {
    return { icon: TrendingDown, bg: 'bg-[var(--status-warning-bg)]', color: 'text-[var(--status-warning)]' }
  }
  if (type === 'training') {
    return { icon: BookOpen, bg: 'bg-secondary', color: 'text-primary' }
  }
  if (type === 'advisory') {
    return { icon: TrendingUp, bg: 'bg-secondary', color: 'text-primary' }
  }
  if (type === 'system') {
    return { icon: Settings, bg: 'bg-muted', color: 'text-muted-foreground' }
  }
  return { icon: Info, bg: 'bg-secondary', color: 'text-primary' }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch notifications: personal + broadcast to farmers
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`recipient_id.eq.${user.id},target_role.eq.farmer`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[NotificationsPage] fetch error:', error.message)
  }

  const notifications = (data ?? []) as Notification[]

  return (
    <div className="flex flex-col min-h-screen md:min-h-0">
      {/* Header */}
      <header className="bg-primary px-4 pb-5 pt-12 md:bg-transparent md:px-0 md:pt-0 md:pb-6">
        <div className="flex items-center justify-between md:justify-start md:gap-4">
          <h1 className="text-xl font-bold text-primary-foreground md:text-3xl md:text-foreground">Notifications</h1>
          <Bell className="h-5 w-5 text-primary-foreground/70 md:hidden" />
        </div>

        {/* Filter tabs — static for MVP */}
        <div className="mt-4 flex gap-2 rounded-xl bg-primary-foreground/10 p-1 md:bg-muted md:w-fit md:mt-6">
          {['All', 'Alerts', 'Updates'].map((label) => (
            <div
              key={label}
              className={`flex-1 rounded-lg py-1.5 px-6 text-center text-sm font-medium transition-colors md:flex-none cursor-pointer ${
                label === 'All'
                  ? 'bg-primary-foreground text-primary shadow-sm md:bg-background'
                  : 'text-primary-foreground/70 md:text-muted-foreground'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="-mt-2 flex flex-col gap-2 rounded-t-2xl bg-background px-4 pt-5 md:mt-0 md:rounded-none md:bg-transparent md:px-0 md:pt-2">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-card rounded-xl border border-border">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-4xl">
              🔔
            </div>
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              You'll receive market alerts and updates here.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 md:max-w-3xl">
          {notifications.map((n) => {
            const { icon: Icon, bg, color } = getIconConfig(n.type, n.severity)
            return (
              <article
                key={n.id}
                className={`flex items-start gap-3 rounded-xl bg-card p-4 shadow-sm ${
                  !n.is_read ? 'border-l-4 border-primary' : 'border border-border'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{n.body}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="h-4 md:hidden" />
      </div>
    </div>
  )
}
