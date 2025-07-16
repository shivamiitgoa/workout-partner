'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SidebarContextType {
  isExpanded: boolean
  toggleSidebar: () => void
  expandSidebar: () => void
  collapseSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({} as SidebarContextType)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: ReactNode
}

const SIDEBAR_STORAGE_KEY = 'workout-partner-sidebar-expanded'

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load persisted sidebar state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      if (stored !== null) {
        const parsedValue = JSON.parse(stored)
        if (typeof parsedValue === 'boolean') {
          setIsExpanded(parsedValue)
        }
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Persist sidebar state changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(isExpanded))
      } catch (error) {
        console.error('Error saving sidebar state:', error)
      }
    }
  }, [isExpanded, isLoaded])

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev)
  }

  const expandSidebar = () => {
    setIsExpanded(true)
  }

  const collapseSidebar = () => {
    setIsExpanded(false)
  }

  const value = {
    isExpanded,
    toggleSidebar,
    expandSidebar,
    collapseSidebar
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
} 