'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Menu } from 'lucide-react'
import FarmerSidebar from '@/components/shared/FarmerSidebar'

export default function FarmerShell({ children }: { children: React.ReactNode }) {
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
      <FarmerSidebar sidebarOpen={sidebarOpen} closeSidebar={closeSidebar} />

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

