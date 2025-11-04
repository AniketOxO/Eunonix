import { useState, useEffect } from 'react'
import { readJSON, writeJSON } from '@/utils/storage'

export interface UserData {
  name: string
  email: string
  photo?: string
  subscription?: {
    plan: 'free' | 'premium' | 'pro'
    status: 'active' | 'inactive' | 'trial'
    expiryDate?: string
  }
  preferences?: {
    theme?: string
    notifications?: boolean
    language?: string
  }
}

const USER_STORAGE_KEY = 'lifeos-user'

const defaultUser: UserData = {
  name: 'User',
  email: '',
  subscription: {
    plan: 'free',
    status: 'active'
  }
}

export function useUser() {
  const [user, setUser] = useState<UserData>(defaultUser)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data on mount
  useEffect(() => {
    const loadUser = () => {
      const userData = readJSON<UserData>(USER_STORAGE_KEY, defaultUser)
      setUser(userData)
      setIsLoading(false)
    }

    loadUser()
  }, [])

  // Save user data whenever it changes
  const updateUser = (updates: Partial<UserData>) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    writeJSON(USER_STORAGE_KEY, updatedUser)
  }

  const updateProfile = (name: string, email: string, photo?: string) => {
    updateUser({ name, email, photo })
  }

  const updateSubscription = (subscription: UserData['subscription']) => {
    updateUser({ subscription })
  }

  const clearUser = () => {
    setUser(defaultUser)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  return {
    user,
    isLoading,
    updateUser,
    updateProfile,
    updateSubscription,
    clearUser
  }
}
