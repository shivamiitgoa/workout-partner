'use client'

import { useAuth } from '../../contexts/AuthContext'

interface UserProfileProps {
  className?: string
}

export const UserProfile = ({ className = '' }: UserProfileProps) => {
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) return null

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user.displayName || 'User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="ml-2 px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  )
} 