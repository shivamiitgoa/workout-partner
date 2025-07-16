'use client'

import { useSidebar } from '../../contexts/SidebarContext'

const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

interface HeaderProps {
  title?: string
  children?: React.ReactNode
}

export const Header = ({ title, children }: HeaderProps) => {
  const { isExpanded, expandSidebar } = useSidebar()

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-4">
        {/* Hamburger menu - only show when sidebar is collapsed */}
        {!isExpanded && (
          <button
            onClick={expandSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Expand sidebar"
          >
            <HamburgerIcon />
          </button>
        )}

        {/* Title */}
        {title && (
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}

        {/* Additional header content */}
        <div className="flex-1 flex justify-end">
          {children}
        </div>
      </div>
    </header>
  )
} 