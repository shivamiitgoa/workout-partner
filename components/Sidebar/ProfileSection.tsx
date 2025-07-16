'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Tooltip } from '../Tooltip/Tooltip'

interface ProfileSectionProps {
  isExpanded: boolean
  onProfileClick?: () => void
}

export const ProfileSection = ({ isExpanded, onProfileClick }: ProfileSectionProps) => {
  const { user, logout, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    setIsMenuOpen(!isMenuOpen)
    onProfileClick?.()
  }

  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) return null

  const avatarElement = (
    <div className="flex-shrink-0">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || 'User'}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
          <span className="text-white font-medium text-sm">
            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )

  const profileContent = (
    <div ref={menuRef} className="relative">
      <div 
        className={`
          flex items-center gap-3 p-3 rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          hover:bg-gray-100 dark:hover:bg-gray-800
          ${isExpanded ? 'mx-3' : 'mx-auto w-fit'}
        `}
        onClick={handleProfileClick}
      >
        {avatarElement}
        
        {isExpanded && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className={`
          absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg
          transition-all duration-200 ease-in-out z-50 bottom-full mb-1
          ${isExpanded ? 'left-3 right-3' : 'left-0 min-w-48'}
        `}>
          <div className="py-1">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loading ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Show tooltip with user info when collapsed (but not when menu is open)
  if (!isExpanded && !isMenuOpen) {
    const tooltipContent = (
      <div className="text-left">
        <div className="font-medium">{user.displayName || 'User'}</div>
        <div className="text-xs opacity-75">{user.email}</div>
      </div>
    )

    return (
      <Tooltip explainer={tooltipContent} side="right">
        {profileContent}
      </Tooltip>
    )
  }

  return profileContent
} 