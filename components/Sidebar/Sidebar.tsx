'use client'

import { usePathname } from 'next/navigation'
import React from 'react';
import { NavigationItem } from './NavigationItem';
import { ProfileSection } from './ProfileSection'
import { useSidebar } from '../../contexts/SidebarContext'
import { Tooltip } from '../Tooltip/Tooltip'
import { useEffect, useRef, useState } from 'react'

// Icons (using simple SVG icons for now)
const WorkoutIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const GameIcon = () => (
  <span className="text-2xl" role="img" aria-label="Trophy">🏆</span>
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
  },
  {
    id: 'game',
    label: 'Game',
    icon: <GameIcon />,
    path: '/game'
  }
  // Future applications will be added here
]

interface SidebarProps {
  onProfileClick?: () => void
}

export const Sidebar = ({ onProfileClick }: SidebarProps) => {
  const { isExpanded, collapseSidebar, expandSidebar } = useSidebar()
  const pathname = usePathname()
  const [showTitle, setShowTitle] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'width' && isExpanded) {
        setShowTitle(true)
      }
    }

    if (isExpanded) {
      sidebar.addEventListener('transitionend', handleTransitionEnd)
    }

    return () => {
      sidebar.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [isExpanded])

  // Hide title immediately when collapsing
  useEffect(() => {
    if (!isExpanded) setShowTitle(false)
  }, [isExpanded])

  const handleProfileClick = () => {
    onProfileClick?.()
  }

  return (
    <div
      ref={sidebarRef}
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
            {showTitle && (
              <h2
                className="text-lg font-semibold text-gray-900 dark:text-white transition-opacity duration-300 opacity-0"
                style={{ opacity: showTitle ? 1 : 0 }}
              >
                Super App
              </h2>
            )}
            <button
              onClick={collapseSidebar}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Collapse sidebar"
            >
              <CollapseIcon />
            </button>
          </div>
        )}

        {/* Hamburger/Expand button and divider (only when collapsed) */}
        {!isExpanded && (
          <div className="flex flex-col items-center pt-4 pb-2">
            <Tooltip explainer="Expand sidebar" side="right">
              <button
                onClick={expandSidebar}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Expand sidebar"
              >
                {/* Hamburger Icon */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </Tooltip>
            <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 my-3" />
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 px-2 py-4 space-y-2">
          {applications.map((app) => (
            <NavigationItem
              key={app.id}
              icon={app.icon}
              label={app.label}
              isActive={pathname.startsWith(app.path)}
              isExpanded={isExpanded}
              href={app.path}
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