"use client"

import { useState } from "react"
import { ProtectedRoute } from "components/Auth"
import { Sidebar } from "components/Sidebar"
import WorkoutPage from "./workout/page"
import { useSidebar } from "../contexts/SidebarContext"

const applications = {
  workout: WorkoutPage
  // Future applications will be added here
}

export default function MainApp() {
  const [currentApp, setCurrentApp] = useState('workout')
  const { isExpanded, expandSidebar } = useSidebar()

  const handleAppChange = (appId: string) => {
    setCurrentApp(appId)
  }

  const handleProfileClick = () => {
    // Navigate to profile/settings page in the future
    console.log('Profile clicked')
  }

  const CurrentAppComponent = applications[currentApp as keyof typeof applications] || WorkoutPage

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar 
          currentApp={currentApp}
          onAppChange={handleAppChange}
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
          {!isExpanded && (
            <button
              onClick={expandSidebar}
              className="fixed top-4 left-20 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Expand sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* App Content */}
          <main className="h-full overflow-hidden">
            <CurrentAppComponent />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
