'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Sprout, BookOpen, Bell, User, X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/crops', label: 'My Crops', icon: Sprout },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/notifications', label: 'Messages', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

interface FarmerSidebarProps {
  sidebarOpen: boolean
  closeSidebar: () => void
}

/**
 * FarmerSidebar component.
 * Provides navigation and logout functionality for the Farmer Portal.
 */
export default function FarmerSidebar({ sidebarOpen, closeSidebar }: FarmerSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      // Refresh to clear any auth state/cache
      router.refresh()
      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary tracking-tight">NHPMS</h2>
        <button 
          className="md:hidden text-muted-foreground hover:bg-muted rounded-full p-2"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <button 
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
