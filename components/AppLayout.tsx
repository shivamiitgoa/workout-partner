"use client"

import { ProtectedRoute } from "components/Auth"
import { Sidebar } from "components/Sidebar"
import { useSidebar } from "../contexts/SidebarContext"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isExpanded } = useSidebar();

  const handleProfileClick = () => {
    // Navigate to profile/settings page in the future
    console.log('Profile clicked')
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar 
          onProfileClick={handleProfileClick}
        />

        {/* Main Content Area */}
        <div 
          className={`
            flex-1 transition-all duration-300 ease-in-out relative
            ${isExpanded ? 'ml-64' : 'ml-16'}
          `}
        >
          {/* Hamburger Menu - Only show when sidebar is collapsed */}
          {/* Removed: Floating hamburger button, now handled in Sidebar */}

          {/* App Content */}
          <main className="h-full overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
} 