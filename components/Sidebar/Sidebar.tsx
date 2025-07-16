'use client'

import { NavigationItem } from './NavigationItem'
import { ProfileSection } from './ProfileSection'
import { useSidebar } from '../../contexts/SidebarContext'

// Icons (using simple SVG icons for now)
const WorkoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const CollapseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
)

// Application definitions - this will be expanded in the future
const applications = [
  {
    id: 'workout',
    label: 'Workout',
    icon: <WorkoutIcon />,
    path: '/workout'
  }
  // Future applications will be added here
]

interface SidebarProps {
  currentApp?: string
  onAppChange?: (appId: string) => void
  onProfileClick?: () => void
}

export const Sidebar = ({ 
  currentApp = 'workout', 
  onAppChange,
  onProfileClick 
}: SidebarProps) => {
  const { isExpanded, collapseSidebar } = useSidebar()

  const handleAppClick = (appId: string) => {
    onAppChange?.(appId)
  }

  const handleProfileClick = () => {
    onProfileClick?.()
  }

  return (
    <div
      className={`
        fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out z-40
        ${isExpanded ? 'w-64' : 'w-16'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header with collapse button (only visible when expanded) */}
        {isExpanded && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workout Partner
            </h2>
            <button
              onClick={collapseSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Collapse sidebar"
            >
              <CollapseIcon />
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 px-2 py-4 space-y-2">
          {applications.map((app) => (
            <NavigationItem
              key={app.id}
              icon={app.icon}
              label={app.label}
              isActive={currentApp === app.id}
              isExpanded={isExpanded}
              onClick={() => handleAppClick(app.id)}
            />
          ))}
        </div>

        {/* Profile Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-4">
          <ProfileSection 
            isExpanded={isExpanded} 
            onProfileClick={handleProfileClick}
          />
        </div>
      </div>
    </div>
  )
} 