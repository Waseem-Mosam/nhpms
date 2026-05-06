'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Sprout, BookOpen, Bell, User, Menu, X, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/crops', label: 'My Crops', icon: Sprout },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/notifications', label: 'Messages', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function FarmerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
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
            onClick={() => { /* implement logout */ }}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-full relative">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 w-full bg-background/90 backdrop-blur-sm border-b border-border px-4 py-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <button 
              className="text-muted-foreground hover:bg-muted rounded-full p-2 -ml-2 transition-colors"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold text-foreground">NHPMS</span>
          </div>
          <Link href="/notifications" className="text-muted-foreground hover:bg-muted rounded-full p-2 transition-colors">
            <Bell className="h-5 w-5" />
          </Link>
        </header>

        <main className="flex-1 w-full relative max-w-7xl mx-auto md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
