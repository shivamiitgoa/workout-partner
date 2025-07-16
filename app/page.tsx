"use client"

import { useState } from "react"
import { ProtectedRoute } from "components/Auth"
import { Header } from "components/Header"
import { Sidebar } from "components/Sidebar"
import WorkoutPage from "./workout/page"
import { useSidebar } from "../contexts/SidebarContext"

const applications = {
  workout: WorkoutPage
  // Future applications will be added here
}

export default function MainApp() {
  const [currentApp, setCurrentApp] = useState('workout')
  const { isExpanded } = useSidebar()

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
            flex-1 flex flex-col transition-all duration-300 ease-in-out
            ${isExpanded ? 'ml-64' : 'ml-16'}
          `}
        >
          {/* Header */}
          <Header title={applications[currentApp as keyof typeof applications] === WorkoutPage ? 'Workout' : 'App'} />

          {/* App Content */}
          <main className="flex-1 overflow-hidden">
            <CurrentAppComponent />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
