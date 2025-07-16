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

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

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