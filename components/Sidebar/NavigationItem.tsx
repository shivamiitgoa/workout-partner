'use client'

import { ReactNode } from 'react'
import { Tooltip } from '../Tooltip/Tooltip'

interface NavigationItemProps {
  icon: ReactNode
  label: string
  isActive?: boolean
  isExpanded: boolean
  onClick?: () => void
  className?: string
}

export const NavigationItem = ({
  icon,
  label,
  isActive = false,
  isExpanded,
  onClick,
  className = ''
}: NavigationItemProps) => {
  const baseClasses = `
    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
    transition-all duration-200 ease-in-out
    hover:bg-gray-100 dark:hover:bg-gray-800
    ${isActive ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}
    ${className}
  `

  const content = (
    <div className={baseClasses} onClick={onClick}>
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      {isExpanded && (
        <span className="font-medium text-sm truncate">
          {label}
        </span>
      )}
    </div>
  )

  // Show tooltip only when collapsed
  if (!isExpanded) {
    return (
      <Tooltip explainer={label} side="right">
        {content}
      </Tooltip>
    )
  }

  return content
} 