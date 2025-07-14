'use client'

import { LoginButton } from './LoginButton'
import { UserProfile } from './UserProfile'
import { useAuth } from '../../contexts/AuthContext'

interface AuthWrapperProps {
  className?: string
}

export const AuthWrapper = ({ className = '' }: AuthWrapperProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={className}>
      {user ? <UserProfile /> : <LoginButton />}
    </div>
  )
} 